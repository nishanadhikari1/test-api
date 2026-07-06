import 'dotenv/config';
import { prisma } from './lib/prisma';

async function main() {
  const users = await prisma.user.findMany();
  console.log('Users in DB:', users);
}

main().finally(() => prisma.$disconnect());