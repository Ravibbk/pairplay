import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

// Default to local sqlite file if DATABASE_URL is not set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

const dbUrl = process.env.DATABASE_URL || '';
const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');
const schema = isPostgres ? './prisma/schema.prisma' : './prisma/schema.sqlite.prisma';

console.log(`🔌 Detected Database Provider: ${isPostgres ? 'PostgreSQL' : 'SQLite'}`);
console.log(`📦 Applying Schema: ${schema}`);

try {
  execSync(`npx prisma db push --schema=${schema}`, {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
  });
  execSync(`npx prisma generate --schema=${schema}`, {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
  });
  console.log('✅ Database schema synchronized successfully.');
} catch (error) {
  console.error('❌ Failed to synchronize database schema:', error);
  process.exit(1);
}
