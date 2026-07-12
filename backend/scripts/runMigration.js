import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function run() {
  const migrationPath = path.join(__dirname, '../../supabase/migrations/202607120000_fix_admin_policies.sql');
  console.log(`Reading migration from: ${migrationPath}`);
  const sql = fs.readFileSync(migrationPath, 'utf8');

  // Split by '-- CMD'
  const commands = sql
    .split('-- CMD')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0);

  console.log(`Found ${commands.length} SQL commands to execute.`);

  try {
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      console.log(`\nExecuting command ${i + 1}/${commands.length}:`);
      console.log(command.substring(0, 100) + (command.length > 100 ? '...' : ''));
      
      await prisma.$executeRawUnsafe(command);
    }
    console.log('\n✅ SQL migration completed successfully!');
  } catch (error) {
    console.error('❌ Error executing SQL migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
