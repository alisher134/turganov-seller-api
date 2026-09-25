import { Injectable } from '@nestjs/common';
import { WbTokenCategory } from '@prisma/client';
import { WbClientService } from '../../wb-client/wb-client.service';
import { ensureStoreId } from '../../common/utils';
import { GetOrdersDto, GetStickersDto } from '../dto';

@Injectable()
export class FbsOrdersService {
  constructor(private readonly wbClient: WbClientService) {}

  async getNewFbsOrders(storeId?: string) {
    return this.wbClient.requestOrAll({
      storeId,
      service: 'marketplace',
      path: '/api/v3/orders/new',
      method: 'GET',
      category: WbTokenCategory.MARKETPLACE,
    });
  }

  async getFbsOrders(dto: GetOrdersDto) {
    const { storeId, limit = 100, next = 0, dateFrom, dateTo } = dto;
    const query: Record<string, string | number | boolean | undefined | null> =
      { limit, next };
    if (dateFrom) query.dateFrom = dateFrom;
    if (dateTo) query.dateTo = dateTo;

    return this.wbClient.requestOrAll({
      storeId,
      service: 'marketplace',
      path: '/api/v3/orders',
      method: 'GET',
      category: WbTokenCategory.MARKETPLACE,
      query,
    });
  }

  async getFbsOrderStatuses(storeId: string, orders: number[]) {
    ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'marketplace',
      path: '/api/v3/orders/status',
      method: 'POST',
      category: WbTokenCategory.MARKETPLACE,
      body: { orders },
    });
  }

  async getFbsStickers(storeId: string, dto: GetStickersDto) {
    ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'marketplace',
      path: '/api/v3/orders/stickers',
      method: 'POST',
      category: WbTokenCategory.MARKETPLACE,
      query: {
        type: dto.type || 'png',
        width: dto.width || 58,
        height: dto.height || 40,
      },
      body: { orders: dto.orders },
    });
  }

  async cancelFbsOrder(storeId: string, orderId: number) {
    ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'marketplace',
      path: `/api/v3/orders/${orderId}/cancel`,
      method: 'PATCH',
      category: WbTokenCategory.MARKETPLACE,
    });
  }

  async getFbsSupplies(
    storeId?: string,
    limit: number = 100,
    next: number = 0,
  ) {
    const query = { limit, next };
    return this.wbClient.requestOrAll({
      storeId,
      service: 'marketplace',
      path: '/api/v3/supplies',
      method: 'GET',
      category: WbTokenCategory.MARKETPLACE,
      query,
    });
  }

  async getPasses(storeId?: string) {
    return this.wbClient.requestOrAll({
      storeId,
      service: 'marketplace',
      path: '/api/v3/passes',
      method: 'GET',
      category: WbTokenCategory.MARKETPLACE,
    });
  }
}
