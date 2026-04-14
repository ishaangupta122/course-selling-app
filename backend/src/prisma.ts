import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$connect();
  console.log(`PostgreSQL connected successfully`);
}

main().catch((e) => {
  console.error(`PostgreSQL connection failed: ${e} !!`);
  process.exit(1);
});

export default prisma;
