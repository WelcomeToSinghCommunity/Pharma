import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function run() {
  const sql = `
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'live_sessions'
      ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.live_sessions;
      END IF;
    END;
    $$;
  `;
  try {
    console.log('Enabling realtime for live_sessions table...');
    await prisma.$executeRawUnsafe(sql);
    console.log('✅ Realtime enabled successfully for live_sessions!');
  } catch (error) {
    console.error('❌ Error enabling realtime:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
