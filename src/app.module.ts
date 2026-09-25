import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { WbClientModule } from './wb-client/wb-client.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { StoresModule } from './stores/stores.module';
import { GeneralModule } from './general/general.module';
import { ItemsModule } from './items/items.module';
import { OrdersModule } from './orders/orders.module';
import { PromotionModule } from './promotion/promotion.module';
import { CommunicationsModule } from './communications/communications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ReportsModule } from './reports/reports.module';
import { FinancesModule } from './finances/finances.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 50,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 200,
      },
    ]),
    PrismaModule,
    HealthModule,
    AuditLogModule,
    AuthModule,
    AdminModule,
    WbClientModule,
    StoresModule,
    GeneralModule,
    ItemsModule,
    OrdersModule,
    PromotionModule,
    CommunicationsModule,
    AnalyticsModule,
    ReportsModule,
    FinancesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
