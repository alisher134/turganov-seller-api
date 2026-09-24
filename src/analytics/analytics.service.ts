import { Injectable, BadRequestException } from '@nestjs/common';
import { WbTokenCategory } from '@prisma/client';
import { WbClientService } from '../wb-client/wb-client.service';
import { SalesFunnelDto } from './dto/sales-funnel.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly wbClient: WbClientService) {}

  async getSalesFunnel(dto: SalesFunnelDto) {
    const { storeId, ...body } = dto;
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'analytics',
        path: '/api/analytics/v3/sales-funnel/products',
        method: 'POST',
        category: WbTokenCategory.ANALYTICS,
        body,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'analytics',
      path: '/api/analytics/v3/sales-funnel/products',
      method: 'POST',
      category: WbTokenCategory.ANALYTICS,
      body,
    });
  }

  async getSalesFunnelHistory(dto: SalesFunnelDto) {
    const { storeId, ...body } = dto;
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'analytics',
        path: '/api/analytics/v3/sales-funnel/products/history',
        method: 'POST',
        category: WbTokenCategory.ANALYTICS,
        body,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'analytics',
      path: '/api/analytics/v3/sales-funnel/products/history',
      method: 'POST',
      category: WbTokenCategory.ANALYTICS,
      body,
    });
  }

  async getOrderFeed(storeId?: string) {
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'analytics',
        path: '/api/analytics/v1/order-feed',
        method: 'GET',
        category: WbTokenCategory.ANALYTICS,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'analytics',
      path: '/api/analytics/v1/order-feed',
      method: 'GET',
      category: WbTokenCategory.ANALYTICS,
    });
  }

  async getSearchReport(storeId: string, body: any) {
    this.ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'analytics',
      path: '/api/v2/search-report/report',
      method: 'POST',
      category: WbTokenCategory.ANALYTICS,
      body,
    });
  }

  async getWbWarehouseStocks(storeId?: string, body?: any) {
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'analytics',
        path: '/api/analytics/v1/stocks-report/wb-warehouses',
        method: 'POST',
        category: WbTokenCategory.ANALYTICS,
        body: body || {},
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'analytics',
      path: '/api/analytics/v1/stocks-report/wb-warehouses',
      method: 'POST',
      category: WbTokenCategory.ANALYTICS,
      body: body || {},
    });
  }

  async getSellerWarehouseStocks(storeId?: string, body?: any) {
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'analytics',
        path: '/api/analytics/v1/stocks-report/seller-warehouses',
        method: 'POST',
        category: WbTokenCategory.ANALYTICS,
        body: body || {},
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'analytics',
      path: '/api/analytics/v1/stocks-report/seller-warehouses',
      method: 'POST',
      category: WbTokenCategory.ANALYTICS,
      body: body || {},
    });
  }

  async getItemRating(storeId?: string, body?: any) {
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'analytics',
        path: '/api/analytics/v2/item-rating',
        method: 'POST',
        category: WbTokenCategory.ANALYTICS,
        body: body || {},
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'analytics',
      path: '/api/analytics/v2/item-rating',
      method: 'POST',
      category: WbTokenCategory.ANALYTICS,
      body: body || {},
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
