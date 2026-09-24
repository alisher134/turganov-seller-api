import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { hashData } from '../src/common/utils';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const username = (process.env.INITIAL_ADMIN_USERNAME || 'admin')
    .trim()
    .toLowerCase();
  const password =
    process.env.INITIAL_ADMIN_PASSWORD || 'admin_secure_password_change_me';

  const existingLeadAdmin = await prisma.user.findFirst({
    where: { role: Role.LEAD_ADMIN },
  });

  if (existingLeadAdmin) {
    console.log(
      `[Seed] LEAD_ADMIN already exists: ${existingLeadAdmin.username}`,
    );
    return;
  }

  const hashedPassword = await hashData(password);
  const user = await prisma.user.upsert({
    where: { username },
    update: {
      password: hashedPassword,
      role: Role.LEAD_ADMIN,
    },
    create: {
      username,
      password: hashedPassword,
      role: Role.LEAD_ADMIN,
    },
  });

  console.log(
    `[Seed] Successfully initialized LEAD_ADMIN: ${user.username} (ID: ${user.id})`,
  );
}

main()
  .catch((e) => {
    console.error('[Seed] Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
