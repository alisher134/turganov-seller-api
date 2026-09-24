import { Injectable, BadRequestException } from '@nestjs/common';
import { WbTokenCategory } from '@prisma/client';
import { WbClientService } from '../wb-client/wb-client.service';
import { GetOrdersDto, GetStickersDto } from './dto';

@Injectable()
export class OrdersService {
  constructor(private readonly wbClient: WbClientService) {}

  // -------------------------------------------------------------
  // FBS Orders
  // -------------------------------------------------------------

  async getNewFbsOrders(storeId?: string) {
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'marketplace',
        path: '/api/v3/orders/new',
        method: 'GET',
        category: WbTokenCategory.MARKETPLACE,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'marketplace',
      path: '/api/v3/orders/new',
      method: 'GET',
      category: WbTokenCategory.MARKETPLACE,
    });
  }

  async getFbsOrders(dto: GetOrdersDto) {
    const { storeId, limit = 100, next = 0, dateFrom, dateTo } = dto;
    const query: Record<string, any> = { limit, next };
    if (dateFrom) query.dateFrom = dateFrom;
    if (dateTo) query.dateTo = dateTo;

    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'marketplace',
        path: '/api/v3/orders',
        method: 'GET',
        category: WbTokenCategory.MARKETPLACE,
        query,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'marketplace',
      path: '/api/v3/orders',
      method: 'GET',
      category: WbTokenCategory.MARKETPLACE,
      query,
    });
  }

  async getFbsOrderStatuses(storeId: string, orders: number[]) {
    this.ensureStoreId(storeId);
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
    this.ensureStoreId(storeId);
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
    this.ensureStoreId(storeId);
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
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'marketplace',
        path: '/api/v3/supplies',
        method: 'GET',
        category: WbTokenCategory.MARKETPLACE,
        query,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'marketplace',
      path: '/api/v3/supplies',
      method: 'GET',
      category: WbTokenCategory.MARKETPLACE,
      query,
    });
  }

  async getPasses(storeId?: string) {
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'marketplace',
        path: '/api/v3/passes',
        method: 'GET',
        category: WbTokenCategory.MARKETPLACE,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'marketplace',
      path: '/api/v3/passes',
      method: 'GET',
      category: WbTokenCategory.MARKETPLACE,
    });
  }

  // -------------------------------------------------------------
  // DBW Orders
  // -------------------------------------------------------------

  async getNewDbwOrders(storeId?: string) {
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'marketplace',
        path: '/api/v3/dbw/orders/new',
        method: 'GET',
        category: WbTokenCategory.MARKETPLACE,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'marketplace',
      path: '/api/v3/dbw/orders/new',
      method: 'GET',
      category: WbTokenCategory.MARKETPLACE,
    });
  }

  async getDbwOrders(dto: GetOrdersDto) {
    const { storeId, limit = 100, next = 0, dateFrom, dateTo } = dto;
    const query: Record<string, any> = { limit, next };
    if (dateFrom) query.dateFrom = dateFrom;
    if (dateTo) query.dateTo = dateTo;

    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'marketplace',
        path: '/api/v3/dbw/orders',
        method: 'GET',
        category: WbTokenCategory.MARKETPLACE,
        query,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'marketplace',
      path: '/api/v3/dbw/orders',
      method: 'GET',
      category: WbTokenCategory.MARKETPLACE,
      query,
    });
  }

  async confirmDbwOrder(storeId: string, orderId: number) {
    this.ensureStoreId(storeId);
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
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'marketplace',
        path: '/api/v3/dbs/orders/new',
        method: 'GET',
        category: WbTokenCategory.MARKETPLACE,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'marketplace',
      path: '/api/v3/dbs/orders/new',
      method: 'GET',
      category: WbTokenCategory.MARKETPLACE,
    });
  }

  async getDbsOrders(dto: GetOrdersDto) {
    const { storeId, limit = 100, next = 0, dateFrom, dateTo } = dto;
    const query: Record<string, any> = { limit, next };
    if (dateFrom) query.dateFrom = dateFrom;
    if (dateTo) query.dateTo = dateTo;

    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'marketplace',
        path: '/api/v3/dbs/orders',
        method: 'GET',
        category: WbTokenCategory.MARKETPLACE,
        query,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'marketplace',
      path: '/api/v3/dbs/orders',
      method: 'GET',
      category: WbTokenCategory.MARKETPLACE,
      query,
    });
  }

  async confirmDbsOrders(storeId: string, orderIds: number[]) {
    this.ensureStoreId(storeId);
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
    this.ensureStoreId(storeId);
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
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'marketplace',
        path: '/api/v3/click-collect/orders/new',
        method: 'GET',
        category: WbTokenCategory.MARKETPLACE,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'marketplace',
      path: '/api/v3/click-collect/orders/new',
      method: 'GET',
      category: WbTokenCategory.MARKETPLACE,
    });
  }

  async getPickupOrders(dto: GetOrdersDto) {
    const { storeId, limit = 100, next = 0, dateFrom, dateTo } = dto;
    const query: Record<string, any> = { limit, next };
    if (dateFrom) query.dateFrom = dateFrom;
    if (dateTo) query.dateTo = dateTo;

    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'marketplace',
        path: '/api/v3/click-collect/orders',
        method: 'GET',
        category: WbTokenCategory.MARKETPLACE,
        query,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'marketplace',
      path: '/api/v3/click-collect/orders',
      method: 'GET',
      category: WbTokenCategory.MARKETPLACE,
      query,
    });
  }

  // -------------------------------------------------------------
  // FBW Supplies
  // -------------------------------------------------------------

  async getFbwSupplies(
    storeId?: string,
    limit: number = 100,
    offset: number = 0,
  ) {
    const query = { limit, offset };
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'supplies',
        path: '/api/v1/supplies',
        method: 'GET',
        category: WbTokenCategory.SUPPLIES,
        query,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'supplies',
      path: '/api/v1/supplies',
      method: 'GET',
      category: WbTokenCategory.SUPPLIES,
      query,
    });
  }

  async getFbwSupply(storeId: string, supplyId: string) {
    this.ensureStoreId(storeId);
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
    this.ensureStoreId(storeId);
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
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'supplies',
        path: '/api/supplies/v1/drafts',
        method: 'GET',
        category: WbTokenCategory.SUPPLIES,
        query,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'supplies',
      path: '/api/supplies/v1/drafts',
      method: 'GET',
      category: WbTokenCategory.SUPPLIES,
      query,
    });
  }

  private ensureStoreId(storeId?: string) {
    if (!storeId || storeId === 'all') {
      throw new BadRequestException(
        'Для этой операции необходимо указать конкретный storeId',
      );
    }
  }
}
