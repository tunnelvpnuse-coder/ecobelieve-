import type { FastifyPluginAsync } from 'fastify';

export interface LiveKitTokenPayload {
  roomName: string;
  identity: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    issueLivekitToken(payload: LiveKitTokenPayload): string;
  }
}

const livekitPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate(
    'issueLivekitToken',
    ({ roomName, identity }: LiveKitTokenPayload) => {
      // Step 1 scaffold placeholder; Step 5 replaces this with signed JWT.
      return `lk_${identity}_${roomName}_${Date.now().toString(36)}`;
    },
  );
};

export default livekitPlugin;
