import { Injectable } from '@nestjs/common';
import { WbTokenCategory } from '@prisma/client';
import { WbClientService } from '../../wb-client/wb-client.service';
import { ensureStoreId } from '../../common/utils';

@Injectable()
export class SuppliesService {
  constructor(private readonly wbClient: WbClientService) {}

  async getFbwSupplies(
    storeId?: string,
    limit: number = 100,
    next: number = 0,
  ) {
    const query = { limit, next };
    return this.wbClient.requestOrAll({
      storeId,
      service: 'supplies',
      path: '/api/v1/supplies',
      method: 'GET',
      category: WbTokenCategory.SUPPLIES,
      query,
    });
  }

  async createFbwSupply(storeId: string, name: string) {
    ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'supplies',
      path: '/api/v1/supplies',
      method: 'POST',
      category: WbTokenCategory.SUPPLIES,
      body: { name },
    });
  }

  async getFbwSupply(storeId: string, supplyId: string) {
    ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'supplies',
      path: `/api/v1/supplies/${supplyId}`,
      method: 'GET',
      category: WbTokenCategory.SUPPLIES,
    });
  }

  async getFbwSupplyGoods(
    storeId: string,
    supplyId: string,
    limit: number = 100,
    offset: number = 0,
  ) {
    ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'supplies',
      path: `/api/v1/supplies/${supplyId}/goods`,
      method: 'GET',
      category: WbTokenCategory.SUPPLIES,
      query: { limit, offset },
    });
  }

  async getFbwDrafts(
    storeId?: string,
    limit: number = 100,
    offset: number = 0,
  ) {
    const query = { limit, offset };
    return this.wbClient.requestOrAll({
      storeId,
      service: 'supplies',
      path: '/api/supplies/v1/drafts',
      method: 'GET',
      category: WbTokenCategory.SUPPLIES,
      query,
    });
  }
}
