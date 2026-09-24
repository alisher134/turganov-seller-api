import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { WbClientModule } from './wb-client/wb-client.module';
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
    PrismaModule,
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
})
export class AppModule {}
