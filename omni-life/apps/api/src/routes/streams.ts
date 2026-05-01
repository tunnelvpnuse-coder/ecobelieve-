import { randomUUID } from 'node:crypto';
import type { FastifyPluginAsync, FastifyReply } from 'fastify';
import { PrismaClient, StreamMode, StreamStatus } from '@prisma/client';

const prisma = new PrismaClient();

const BASE_PROFANITY = ['damn', 'hell'];
const STRICT_PROFANITY = ['sex', 'drugs', 'violence'];

interface StartStreamBody {
  title: string;
  mode: StreamMode;
  is_kid: boolean;
  kid_profile_id?: string;
  parental_consent?: boolean;
  tags?: string[];
}

const startStreamSchema = {
  body: {
    type: 'object',
    additionalProperties: false,
    properties: {
      title: { type: 'string', minLength: 3, maxLength: 120 },
      mode: {
        type: 'string',
        enum: ['GO_OUT', 'STAY_IN', 'FAMILY_STUDIO'],
      },
      is_kid: { type: 'boolean' },
      kid_profile_id: { type: 'string' },
      parental_consent: { type: 'boolean' },
      tags: {
        type: 'array',
        items: { type: 'string', minLength: 1, maxLength: 24 },
        maxItems: 8,
      },
    },
    required: ['title', 'mode', 'is_kid'],
  },
  response: {
    201: {
      type: 'object',
      properties: {
        stream: { type: 'object', additionalProperties: true },
        livekit_token: { type: 'string' },
      },
      required: ['stream', 'livekit_token'],
    },
  },
} as const;

function containsProfanity(title: string, strict: boolean): boolean {
  const normalized = title.toLowerCase();
  const words = new Set(
    normalized
      .split(/[^a-z0-9]+/)
      .map((token) => token.trim())
      .filter(Boolean),
  );

  const blocked = strict
    ? [...BASE_PROFANITY, ...STRICT_PROFANITY]
    : BASE_PROFANITY;

  return blocked.some((word) => words.has(word));
}

function parentalConsentError(reply: FastifyReply): ReturnType<FastifyReply['code']> {
  return reply.code(403).send({
    code: 'PARENTAL_CONSENT_REQUIRED',
    message:
      'Family Studio requires kid mode, approved profile consent, and parental confirmation.',
  });
}

const streamsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: StartStreamBody }>(
    '/start',
    { schema: startStreamSchema },
    async (request, reply) => {
      if (!request.user?.id) {
        return reply.code(401).send({ code: 'UNAUTHORIZED' });
      }

      const { title, mode, is_kid, kid_profile_id, parental_consent = false } =
        request.body;

      const activeStreamCount = await prisma.stream.count({
        where: {
          user_id: request.user.id,
          status: {
            in: [StreamStatus.PENDING, StreamStatus.LIVE],
          },
        },
      });

      if (activeStreamCount >= 3) {
        return reply.code(429).send({
          code: 'TOO_MANY_ACTIVE_STREAMS',
          message: 'You can only run up to 3 concurrent streams.',
        });
      }

      const strictProfanityFilter = is_kid || mode === StreamMode.FAMILY_STUDIO;
      if (containsProfanity(title, strictProfanityFilter)) {
        return reply.code(400).send({
          code: 'TITLE_CONTAINS_PROFANITY',
          message: 'Stream title contains blocked language.',
        });
      }

      let kidProfileId: string | null = null;
      if (mode === StreamMode.FAMILY_STUDIO) {
        if (!is_kid || !kid_profile_id || !parental_consent) {
          return parentalConsentError(reply);
        }

        const kidProfile = await prisma.kidProfile.findUnique({
          where: { id: kid_profile_id },
          select: {
            id: true,
            parent_id: true,
            parental_consent: true,
            allowed_modes: true,
          },
        });

        const isValidProfile =
          kidProfile &&
          kidProfile.parent_id === request.user.id &&
          kidProfile.parental_consent &&
          kidProfile.allowed_modes.includes(StreamMode.FAMILY_STUDIO);

        if (!isValidProfile) {
          return parentalConsentError(reply);
        }

        kidProfileId = kid_profile_id;
      } else if (is_kid && kid_profile_id) {
        kidProfileId = kid_profile_id;
      }

      const livekitRoomId = `room_${request.user.id}_${Date.now().toString(36)}`;
      const livekitToken = `lk_${request.user.id}_${randomUUID()}`;

      const stream = await prisma.stream.create({
        data: {
          title,
          mode,
          status: StreamStatus.LIVE,
          is_private: mode === StreamMode.FAMILY_STUDIO,
          user_id: request.user.id,
          kid_profile_id: kidProfileId,
          tags: request.body.tags ?? [],
          is_family_safe: true,
          safety_score: 1,
          livekit_room_id: livekitRoomId,
          livekit_token: livekitToken,
          started_at: new Date(),
        },
        select: {
          id: true,
          title: true,
          mode: true,
          status: true,
          is_private: true,
          kid_profile_id: true,
          livekit_room_id: true,
          started_at: true,
          tags: true,
        },
      });

      return reply.code(201).send({
        stream,
        livekit_token: livekitToken,
      });
    },
  );
};

export default streamsRoutes;
