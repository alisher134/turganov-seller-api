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
  } else {
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

  const storesCount = await prisma.store.count();
  if (storesCount === 0) {
    const defaultStores = [
      {
        name: 'ИП Магазин 1',
        inn: '123456789001',
        description: 'Магазин №1 (ИП)',
        tokenEnv: 'WB_SELLER_TOKEN_SHOP1',
      },
      {
        name: 'ИП Магазин 2',
        inn: '123456789002',
        description: 'Магазин №2 (ИП)',
        tokenEnv: 'WB_SELLER_TOKEN_SHOP2',
      },
      {
        name: 'ИП Магазин 3',
        inn: '123456789003',
        description: 'Магазин №3 (ИП)',
        tokenEnv: 'WB_SELLER_TOKEN_SHOP3',
      },
      {
        name: 'ИП Магазин 4',
        inn: '123456789004',
        description: 'Магазин №4 (ИП)',
        tokenEnv: 'WB_SELLER_TOKEN_SHOP4',
      },
      {
        name: 'ИП Магазин 5',
        inn: '123456789005',
        description: 'Магазин №5 (ИП)',
        tokenEnv: 'WB_SELLER_TOKEN_SHOP5',
      },
    ];

    for (const storeData of defaultStores) {
      const createdStore = await prisma.store.create({
        data: {
          name: storeData.name,
          inn: storeData.inn,
          description: storeData.description,
        },
      });

      const tokenValue = process.env[storeData.tokenEnv];
      if (tokenValue && !tokenValue.includes('your_token_here')) {
        await prisma.wbApiToken.create({
          data: {
            storeId: createdStore.id,
            token: tokenValue.trim(),
            tokenName: 'Основной токен',
            category: 'STANDARD',
          },
        });
      }
    }
    console.log('[Seed] Initialized 5 stores for multi-store management');
  }
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
