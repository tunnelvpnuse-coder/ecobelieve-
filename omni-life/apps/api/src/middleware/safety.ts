import type { FastifyPluginAsync } from 'fastify';
import type { AuthenticatedUser } from '../types.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

const safetyMiddleware: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', async (request, reply) => {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '').trim();
      if (!token) {
        return;
      }

      const payload = await request.jwtVerify<AuthenticatedUser>();
      request.user = payload;

      if (payload.suspendedAt) {
        await reply.code(403).send({
          code: 'ACCOUNT_SUSPENDED',
          message: 'Suspended accounts cannot access this resource.',
        });
      }
    } catch {
      // Public routes are allowed to proceed; protected routes validate auth.
    }
  });

  fastify.addHook('onResponse', async (request, reply) => {
    if (reply.statusCode >= 400) {
      request.log.warn(
        {
          method: request.method,
          path: request.url,
          statusCode: reply.statusCode,
          userId: request.user?.id ?? null,
          requestId: request.id,
        },
        'Audit log for 4xx/5xx response',
      );
    }
  });
};

export default safetyMiddleware;
