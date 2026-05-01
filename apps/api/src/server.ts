import Fastify from "fastify";
import authPlugin from "./plugins/auth";
import livekitPlugin from "./plugins/livekit";
import safetyPlugin from "./middleware/safety";
import { streamsRoutes } from "./routes/streams";

/**
 * Omni Life API (Fastify v4). Registers versioned routes under `/v1`.
 */
export async function buildServer() {
  const fastify = Fastify({
    logger: true,
  });

  await fastify.register(safetyPlugin);
  await fastify.register(authPlugin);
  await fastify.register(livekitPlugin);

  fastify.get("/health", async () => ({ ok: true, service: "omni-life-api" }));

  await fastify.register(
    async (instance) => {
      await streamsRoutes(instance);
    },
    { prefix: "/v1" }
  );

  return fastify;
}

async function main() {
  const app = await buildServer();
  const port = Number(process.env.PORT ?? 8787);
  const host = process.env.HOST ?? "0.0.0.0";
  await app.listen({ port, host });
}

if (process.env.NODE_ENV !== "test") {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
