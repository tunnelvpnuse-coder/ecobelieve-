import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { StreamMode, StreamStatus } from "@prisma/client";
import { prisma } from "@omni-life/db";

const STRICT_PROFANITY = /\b(badword|profanity)\b/i;
const LOOSE_PROFANITY = /\b(fuck|shit)\b/i;

type StartBody = {
  title: string;
  mode: keyof typeof StreamMode | StreamMode;
  is_kid?: boolean;
  kid_profile_id?: string;
  parental_consent?: boolean;
  tags?: string[];
};

/**
 * Reject stream titles containing obvious profanity.
 * KID profiles use a stricter pattern (placeholder list; replace with service).
 */
function titleFailsProfanityFilter(title: string, strict: boolean): boolean {
  const t = title.trim();
  if (strict) return STRICT_PROFANITY.test(t) || LOOSE_PROFANITY.test(t);
  return LOOSE_PROFANITY.test(t);
}

async function assertNotSuspended(userId: string, reply: FastifyReply): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { suspended: true },
  });
  if (!user) {
    reply.code(404).send({ error: "USER_NOT_FOUND" });
    return false;
  }
  if (user.suspended) {
    reply.code(403).send({ error: "ACCOUNT_SUSPENDED", message: "This account is suspended" });
    return false;
  }
  return true;
}

/**
 * POST /v1/streams/start — create stream, enforce FAMILY_STUDIO parental gate, concurrency, title safety.
 */
export async function streamsRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: StartBody }>(
    "/streams/start",
    {
      preHandler: [
        fastify.authenticate,
        async (request: FastifyRequest, reply: FastifyReply) => {
          const userId = (request as FastifyRequest & { userId: string }).userId;
          const ok = await assertNotSuspended(userId, reply);
          if (!ok) return reply;
        },
      ],
      schema: {
        body: {
          type: "object",
          required: ["title", "mode"],
          properties: {
            title: { type: "string", minLength: 1, maxLength: 200 },
            mode: { type: "string", enum: ["GO_OUT", "STAY_IN", "FAMILY_STUDIO"] },
            is_kid: { type: "boolean" },
            kid_profile_id: { type: "string" },
            parental_consent: { type: "boolean" },
            tags: { type: "array", items: { type: "string" } },
          },
        },
      },
    },
    async (request, reply) => {
      const userId = (request as FastifyRequest & { userId: string }).userId;
      const { title, mode, is_kid, kid_profile_id, parental_consent, tags } = request.body;

      const modeEnum = mode as StreamMode;

      /** FAMILY_STUDIO: server-side parental consent and kid eligibility (§7). */
      if (modeEnum === StreamMode.FAMILY_STUDIO) {
        if (!is_kid) {
          return reply.code(403).send({ error: "PARENTAL_CONSENT_REQUIRED", message: "Family Studio requires kid context" });
        }
        if (!kid_profile_id) {
          return reply.code(403).send({ error: "PARENTAL_CONSENT_REQUIRED", message: "kid_profile_id is required" });
        }
        if (parental_consent !== true) {
          return reply.code(403).send({ error: "PARENTAL_CONSENT_REQUIRED", message: "parental_consent must be true" });
        }

        const kid = await prisma.kidProfile.findFirst({
          where: { id: kid_profile_id, parent_id: userId },
          select: {
            id: true,
            parental_consent: true,
            allowed_modes: true,
            content_filter_level: true,
          },
        });

        if (!kid) {
          return reply.code(403).send({ error: "PARENTAL_CONSENT_REQUIRED", message: "Kid profile not found for parent" });
        }
        if (!kid.parental_consent) {
          return reply.code(403).send({ error: "PARENTAL_CONSENT_REQUIRED", message: "Recorded parental consent missing" });
        }
        if (!kid.allowed_modes.includes(StreamMode.FAMILY_STUDIO)) {
          return reply.code(403).send({
            error: "PARENTAL_CONSENT_REQUIRED",
            message: "FAMILY_STUDIO not allowed for this kid profile",
          });
        }

        const strictKidTitle = kid.content_filter_level >= 4;
        if (titleFailsProfanityFilter(title, strictKidTitle)) {
          return reply.code(400).send({ error: "TITLE_NOT_ALLOWED", message: "Title failed safety filter for kid profile" });
        }
      } else {
        const isKidContext = Boolean(is_kid && kid_profile_id);
        if (isKidContext && kid_profile_id) {
          const kid = await prisma.kidProfile.findFirst({
            where: { id: kid_profile_id, parent_id: userId },
            select: { content_filter_level: true },
          });
          if (!kid) {
            return reply.code(403).send({ error: "KID_PROFILE_FORBIDDEN", message: "Kid profile not found for parent" });
          }
          const strict = kid.content_filter_level >= 4;
          if (titleFailsProfanityFilter(title, strict)) {
            return reply.code(400).send({ error: "TITLE_NOT_ALLOWED", message: "Title failed safety filter" });
          }
        } else if (titleFailsProfanityFilter(title, false)) {
          return reply.code(400).send({ error: "TITLE_NOT_ALLOWED", message: "Title failed safety filter" });
        }
      }

      const concurrent = await prisma.stream.count({
        where: { user_id: userId, status: StreamStatus.LIVE },
      });
      if (concurrent >= 3) {
        return reply.code(429).send({ error: "CONCURRENT_STREAM_LIMIT", message: "Maximum 3 concurrent live streams" });
      }

      const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const livekitToken = fastify.createLiveKitToken(roomId, userId);

      const stream = await prisma.stream.create({
        data: {
          title: title.trim(),
          mode: modeEnum,
          status: StreamStatus.LIVE,
          is_private: modeEnum === StreamMode.FAMILY_STUDIO,
          livekit_room_id: roomId,
          livekit_token: livekitToken,
          user_id: userId,
          kid_profile_id: kid_profile_id ?? null,
          tags: tags ?? [],
          is_family_safe: modeEnum === StreamMode.FAMILY_STUDIO,
          safety_score: 1,
          started_at: new Date(),
        },
        select: {
          id: true,
          title: true,
          mode: true,
          status: true,
          livekit_room_id: true,
          user_id: true,
          kid_profile_id: true,
          tags: true,
          started_at: true,
        },
      });

      return reply.send({
        stream,
        livekit_token: livekitToken,
      });
    }
  );
}
