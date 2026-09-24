import { Injectable } from '@nestjs/common';
import { WbTokenCategory } from '@prisma/client';
import { WbClientService } from '../wb-client/wb-client.service';

@Injectable()
export class ReportsService {
  constructor(private readonly wbClient: WbClientService) {}

  async getOrdersReport(
    storeId?: string,
    dateFrom: string = new Date(Date.now() - 7 * 86400000).toISOString(),
    flag: number = 0,
  ) {
    const query = { dateFrom, flag };
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'statistics',
        path: '/api/v1/supplier/orders',
        method: 'GET',
        category: WbTokenCategory.ANALYTICS,
        query,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'statistics',
      path: '/api/v1/supplier/orders',
      method: 'GET',
      category: WbTokenCategory.ANALYTICS,
      query,
    });
  }

  async getSalesReport(
    storeId?: string,
    dateFrom: string = new Date(Date.now() - 7 * 86400000).toISOString(),
    flag: number = 0,
  ) {
    const query = { dateFrom, flag };
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'statistics',
        path: '/api/v1/supplier/sales',
        method: 'GET',
        category: WbTokenCategory.ANALYTICS,
        query,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'statistics',
      path: '/api/v1/supplier/sales',
      method: 'GET',
      category: WbTokenCategory.ANALYTICS,
      query,
    });
  }

  async getWarehouseRemains(storeId?: string) {
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'statistics',
        path: '/api/v1/warehouse_remains',
        method: 'GET',
        category: WbTokenCategory.ANALYTICS,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'statistics',
      path: '/api/v1/warehouse_remains',
      method: 'GET',
      category: WbTokenCategory.ANALYTICS,
    });
  }

  async getPaidStorage(storeId?: string, dateFrom?: string, dateTo?: string) {
    const query: Record<string, any> = {};
    if (dateFrom) query.dateFrom = dateFrom;
    if (dateTo) query.dateTo = dateTo;

    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'statistics',
        path: '/api/v1/paid_storage',
        method: 'GET',
        category: WbTokenCategory.ANALYTICS,
        query,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'statistics',
      path: '/api/v1/paid_storage',
      method: 'GET',
      category: WbTokenCategory.ANALYTICS,
      query,
    });
  }

  async getRegionSales(storeId?: string, dateFrom?: string, dateTo?: string) {
    const query: Record<string, any> = {};
    if (dateFrom) query.dateFrom = dateFrom;
    if (dateTo) query.dateTo = dateTo;

    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'statistics',
        path: '/api/v1/analytics/region-sale',
        method: 'GET',
        category: WbTokenCategory.ANALYTICS,
        query,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'statistics',
      path: '/api/v1/analytics/region-sale',
      method: 'GET',
      category: WbTokenCategory.ANALYTICS,
      query,
    });
  }

  async getGoodsReturn(storeId?: string, dateFrom?: string) {
    const query: Record<string, any> = {};
    if (dateFrom) query.dateFrom = dateFrom;

    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'statistics',
        path: '/api/v1/analytics/goods-return',
        method: 'GET',
        category: WbTokenCategory.ANALYTICS,
        query,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'statistics',
      path: '/api/v1/analytics/goods-return',
      method: 'GET',
      category: WbTokenCategory.ANALYTICS,
      query,
    });
  }

  async getDeductions(storeId?: string, dateFrom?: string, dateTo?: string) {
    const query: Record<string, any> = {};
    if (dateFrom) query.dateFrom = dateFrom;
    if (dateTo) query.dateTo = dateTo;

    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'statistics',
        path: '/api/analytics/v1/deductions',
        method: 'GET',
        category: WbTokenCategory.ANALYTICS,
        query,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'statistics',
      path: '/api/analytics/v1/deductions',
      method: 'GET',
      category: WbTokenCategory.ANALYTICS,
      query,
    });
  }
}
