import { Injectable } from '@nestjs/common';
import { WbTokenCategory } from '@prisma/client';
import { WbClientService } from '../../wb-client/wb-client.service';
import { ensureStoreId } from '../../common/utils';
import { GetOrdersDto } from '../dto';

@Injectable()
export class DbsOrdersService {
  constructor(private readonly wbClient: WbClientService) {}

  // -------------------------------------------------------------
  // DBW Orders
  // -------------------------------------------------------------

  async getNewDbwOrders(storeId?: string) {
    return this.wbClient.requestOrAll({
      storeId,
      service: 'marketplace',
      path: '/api/v3/dbw/orders/new',
      method: 'GET',
      category: WbTokenCategory.MARKETPLACE,
    });
  }

  async getDbwOrders(dto: GetOrdersDto) {
    const { storeId, limit = 100, next = 0, dateFrom, dateTo } = dto;
    const query: Record<string, string | number | boolean | undefined | null> =
      { limit, next };
    if (dateFrom) query.dateFrom = dateFrom;
    if (dateTo) query.dateTo = dateTo;

    return this.wbClient.requestOrAll({
      storeId,
      service: 'marketplace',
      path: '/api/v3/dbw/orders',
      method: 'GET',
      category: WbTokenCategory.MARKETPLACE,
      query,
    });
  }

  async confirmDbwOrder(storeId: string, orderId: number) {
    ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'marketplace',
      path: `/api/v3/dbw/orders/${orderId}/confirm`,
      method: 'PATCH',
      category: WbTokenCategory.MARKETPLACE,
    });
  }

  // -------------------------------------------------------------
  // DBS Orders
  // -------------------------------------------------------------

  async getNewDbsOrders(storeId?: string) {
    return this.wbClient.requestOrAll({
      storeId,
      service: 'marketplace',
      path: '/api/v3/dbs/orders/new',
      method: 'GET',
      category: WbTokenCategory.MARKETPLACE,
    });
  }

  async getDbsOrders(dto: GetOrdersDto) {
    const { storeId, limit = 100, next = 0, dateFrom, dateTo } = dto;
    const query: Record<string, string | number | boolean | undefined | null> =
      { limit, next };
    if (dateFrom) query.dateFrom = dateFrom;
    if (dateTo) query.dateTo = dateTo;

    return this.wbClient.requestOrAll({
      storeId,
      service: 'marketplace',
      path: '/api/v3/dbs/orders',
      method: 'GET',
      category: WbTokenCategory.MARKETPLACE,
      query,
    });
  }

  async confirmDbsOrders(storeId: string, orderIds: number[]) {
    ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'marketplace',
      path: '/api/marketplace/v3/dbs/orders/status/confirm',
      method: 'POST',
      category: WbTokenCategory.MARKETPLACE,
      body: { orders: orderIds },
    });
  }

  async deliverDbsOrders(storeId: string, orderIds: number[]) {
    ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'marketplace',
      path: '/api/marketplace/v3/dbs/orders/status/deliver',
      method: 'POST',
      category: WbTokenCategory.MARKETPLACE,
      body: { orders: orderIds },
    });
  }

  // -------------------------------------------------------------
  // Click & Collect (In-Store Pickup)
  // -------------------------------------------------------------

  async getNewPickupOrders(storeId?: string) {
    return this.wbClient.requestOrAll({
      storeId,
      service: 'marketplace',
      path: '/api/v3/click-collect/orders/new',
      method: 'GET',
      category: WbTokenCategory.MARKETPLACE,
    });
  }

  async getPickupOrders(dto: GetOrdersDto) {
    const { storeId, limit = 100, next = 0, dateFrom, dateTo } = dto;
    const query: Record<string, string | number | boolean | undefined | null> =
      { limit, next };
    if (dateFrom) query.dateFrom = dateFrom;
    if (dateTo) query.dateTo = dateTo;

    return this.wbClient.requestOrAll({
      storeId,
      service: 'marketplace',
      path: '/api/v3/click-collect/orders',
      method: 'GET',
      category: WbTokenCategory.MARKETPLACE,
      query,
    });
  }
}
