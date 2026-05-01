import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import sensible from '@fastify/sensible';
import livekitPlugin from './plugins/livekit.js';
import safetyMiddleware from './middleware/safety.js';
import streamsRoutes from './routes/streams.js';
import usersRoutes from './routes/users.js';

const app = Fastify({
  logger: true,
});

await app.register(sensible);
await app.register(cors, {
  origin: (process.env.ALLOWED_ORIGINS ?? '').split(',').filter(Boolean),
});
await app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET ?? 'development-secret',
});
await app.register(livekitPlugin);
await app.register(safetyMiddleware);

app.get('/health', async () => ({ status: 'ok' }));

await app.register(streamsRoutes, { prefix: '/v1/streams' });
await app.register(usersRoutes, { prefix: '/v1/users' });

const port = Number(process.env.PORT ?? 4000);
await app.listen({ host: '0.0.0.0', port });
