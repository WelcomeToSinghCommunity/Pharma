import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function run() {
  try {
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users in the profiles table:`);
    console.log(JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error fetching users from DB:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
