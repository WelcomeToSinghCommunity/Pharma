import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function run() {
  const sql = `
    CREATE OR REPLACE FUNCTION public.is_admin()
    RETURNS boolean
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = public
    AS $$
      SELECT EXISTS (
        SELECT 1
        FROM auth.users
        WHERE id = auth.uid()
          AND lower(email) IN (
            'harideepsingh13@gmail.com',
            'kishansingh.nmims@gmail.com',
            'contact@nextgenpharma.org'
          )
      );
    $$;
  `;
  try {
    console.log('Updating public.is_admin() to query auth.users directly...');
    await prisma.$executeRawUnsafe(sql);
    console.log('✅ public.is_admin() updated successfully!');
  } catch (error) {
    console.error('❌ Error updating is_admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
