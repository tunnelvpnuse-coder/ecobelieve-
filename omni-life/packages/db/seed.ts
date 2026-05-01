/**
 * Seed script placeholder for Step 1 scaffold.
 * Step 2 will populate required sample records.
 */
import { prisma } from './client';

async function main(): Promise<void> {
  await prisma.$connect();
  // Keep Step 1 deterministic and side-effect free.
  // Real seed data is implemented in Step 2.
  // eslint-disable-next-line no-console
  console.log('Omni Life DB seed scaffold ready.');
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
