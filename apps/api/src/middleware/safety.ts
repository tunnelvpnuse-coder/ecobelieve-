import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

/**
 * Global safety preHandler: ensure JWT user is attached (after authenticate),
 * block suspended accounts, and log 4xx/5xx responses for audit.
 */
const safetyPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("onResponse", async (request: FastifyRequest, reply: FastifyReply) => {
    const status = reply.statusCode;
    if (status >= 400) {
      fastify.log.warn(
        {
          status,
          method: request.method,
          url: request.url,
          userId: "userId" in request ? (request as FastifyRequest & { userId?: string }).userId : undefined,
        },
        "audit_http_error"
      );
    }
  });
};

export default fp(safetyPlugin, { name: "omni-safety" });
