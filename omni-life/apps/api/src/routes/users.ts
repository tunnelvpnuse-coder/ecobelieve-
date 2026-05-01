import type { FastifyPluginAsync } from 'fastify';

const usersRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/:id/profile',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
      },
    },
    async (request) => {
      const { id } = request.params as { id: string };
      return {
        id,
        displayName: 'Scaffold User',
      };
    },
  );
};

export default usersRoutes;
