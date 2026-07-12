import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function run() {
  try {
    console.log('Simulating request as kishansingh.nmims@gmail.com...');
    
    const result = await prisma.$transaction(async (tx) => {
      // 1. Simulate the JWT claims that Supabase sets
      await tx.$executeRawUnsafe(
        `SELECT set_config('request.jwt.claims', '{"email": "kishansingh.nmims@gmail.com", "sub": "be2742ed-3e2c-460d-8aa9-4863f0bc631a"}', true)`
      );
      
      // 2. Call public.is_admin()
      const isAdminRes = await tx.$queryRawUnsafe('SELECT public.is_admin() as is_admin');
      const isAdmin = isAdminRes[0]?.is_admin;
      console.log('public.is_admin() returned:', isAdmin);
      
      // 3. Query the profiles table (this will trigger RLS policies using the simulated claims)
      const profiles = await tx.$queryRawUnsafe('SELECT * FROM public.profiles');
      return { isAdmin, profiles };
    });

    console.log('Simulated query results:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error running RLS simulation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
