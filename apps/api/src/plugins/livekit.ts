import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";

/**
 * LiveKit token generation placeholder (STEP 3 scaffold).
 * Wire LIVEKIT_API_KEY / LIVEKIT_API_SECRET in production.
 */
const livekitPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.decorate(
    "createLiveKitToken",
    (_roomId: string, _identity: string) => {
      return `placeholder-livekit-token-${Date.now()}`;
    }
  );
};

declare module "fastify" {
  interface FastifyInstance {
    createLiveKitToken: (roomId: string, identity: string) => string;
  }
}

export default fp(livekitPlugin, { name: "omni-livekit" });
