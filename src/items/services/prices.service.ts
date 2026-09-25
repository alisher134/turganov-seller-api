import { Injectable } from '@nestjs/common';
import { WbTokenCategory } from '@prisma/client';
import { WbClientService } from '../../wb-client/wb-client.service';
import { ensureStoreId } from '../../common/utils';
import { UploadPricesDto } from '../dto';

@Injectable()
export class PricesService {
  constructor(private readonly wbClient: WbClientService) {}

  async getPrices(
    storeId?: string,
    limit: number = 100,
    offset: number = 0,
    filterNmId?: number,
  ) {
    const query: Record<string, string | number | boolean | undefined | null> =
      { limit, offset };
    if (filterNmId) query.filterNmID = filterNmId;

    return this.wbClient.requestOrAll({
      storeId,
      service: 'prices',
      path: '/api/v2/list/goods/filter',
      method: 'GET',
      category: WbTokenCategory.PRICES,
      query,
    });
  }

  async uploadPrices(storeId: string, dto: UploadPricesDto) {
    ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'prices',
      path: '/api/v2/upload/task',
      method: 'POST',
      category: WbTokenCategory.PRICES,
      body: dto.data,
    });
  }

  async getPriceUploadTasks(storeId?: string) {
    return this.wbClient.requestOrAll({
      storeId,
      service: 'prices',
      path: '/api/v2/buffer/tasks',
      method: 'GET',
      category: WbTokenCategory.PRICES,
    });
  }
}
