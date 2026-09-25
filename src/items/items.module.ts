import { Module } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';

import {
  CardsService,
  PricesService,
  WarehousesService,
  ContentDirectoriesService,
} from './services';

@Module({
  controllers: [ItemsController],
  providers: [
    CardsService,
    PricesService,
    WarehousesService,
    ContentDirectoriesService,
    ItemsService,
  ],
  exports: [
    CardsService,
    PricesService,
    WarehousesService,
    ContentDirectoriesService,
    ItemsService,
  ],
})
export class ItemsModule {}
