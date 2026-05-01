import fp from "fastify-plugin";
import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import jwt from "@fastify/jwt";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

/**
 * JWT auth plugin: verifies Bearer token and sets request.userId.
 * In tests, `x-test-user-id` header is accepted when NODE_ENV=test.
 */
const authPlugin: FastifyPluginAsync = async (fastify) => {
  const secret = process.env.JWT_SECRET ?? "dev-insecure-secret-change-me";

  await fastify.register(jwt, { secret });

  fastify.decorate(
    "authenticate",
    async function authenticate(request: FastifyRequest, reply: FastifyReply) {
      if (process.env.NODE_ENV === "test") {
        const testId = request.headers["x-test-user-id"];
        if (typeof testId === "string" && testId.length > 0) {
          (request as FastifyRequest & { userId: string }).userId = testId;
          return;
        }
      }
      try {
        const payload = await request.jwtVerify<{ sub: string }>();
        (request as FastifyRequest & { userId: string }).userId = payload.sub;
      } catch {
        return reply.code(401).send({ error: "UNAUTHORIZED", message: "Invalid or missing token" });
      }
    }
  );
};

export default fp(authPlugin, { name: "omni-auth" });
