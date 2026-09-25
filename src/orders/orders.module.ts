import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

import {
  FbsOrdersService,
  DbsOrdersService,
  SuppliesService,
} from './services';

@Module({
  controllers: [OrdersController],
  providers: [
    FbsOrdersService,
    DbsOrdersService,
    SuppliesService,
    OrdersService,
  ],
  exports: [FbsOrdersService, DbsOrdersService, SuppliesService, OrdersService],
})
export class OrdersModule {}
