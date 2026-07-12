import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function run() {
  try {
    const users = await prisma.$queryRawUnsafe('SELECT id, email, created_at, last_sign_in_at FROM auth.users');
    console.log(`Found ${users.length} users in auth.users:`);
    console.log(JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error fetching from auth.users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
