import { Injectable } from '@nestjs/common';
import { WbTokenCategory } from '@prisma/client';
import { WbClientService } from '../wb-client/wb-client.service';
import { ensureStoreId } from '../common/utils';
import { SalesReportsListDto } from './dto/sales-reports.dto';

@Injectable()
export class FinancesService {
  constructor(private readonly wbClient: WbClientService) {}

  async getBalance(storeId?: string) {
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'finance',
        path: '/api/v1/account/balance',
        method: 'GET',
        category: WbTokenCategory.DOCUMENTS,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'finance',
      path: '/api/v1/account/balance',
      method: 'GET',
      category: WbTokenCategory.DOCUMENTS,
    });
  }

  async getSalesReportsList(dto: SalesReportsListDto) {
    const { storeId, ...body } = dto;
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'finance',
        path: '/api/finance/v1/sales-reports/list',
        method: 'POST',
        category: WbTokenCategory.DOCUMENTS,
        body,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'finance',
      path: '/api/finance/v1/sales-reports/list',
      method: 'POST',
      category: WbTokenCategory.DOCUMENTS,
      body,
    });
  }

  async getDetailedSalesReport(storeId: string, reportId: number) {
    ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'finance',
      path: `/api/finance/v1/sales-reports/detailed/${reportId}`,
      method: 'POST',
      category: WbTokenCategory.DOCUMENTS,
      body: {},
    });
  }

  async getAcquiringList(dto: SalesReportsListDto) {
    const { storeId, ...body } = dto;
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'finance',
        path: '/api/finance/v1/acquiring/list',
        method: 'POST',
        category: WbTokenCategory.DOCUMENTS,
        body,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'finance',
      path: '/api/finance/v1/acquiring/list',
      method: 'POST',
      category: WbTokenCategory.DOCUMENTS,
      body,
    });
  }

  async getDocumentCategories(storeId?: string) {
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'documents',
        path: '/api/v1/documents/categories',
        method: 'GET',
        category: WbTokenCategory.DOCUMENTS,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'documents',
      path: '/api/v1/documents/categories',
      method: 'GET',
      category: WbTokenCategory.DOCUMENTS,
    });
  }

  async getDocumentsList(storeId?: string, category?: string) {
    const query = category ? { category } : undefined;
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'documents',
        path: '/api/v1/documents/list',
        method: 'GET',
        category: WbTokenCategory.DOCUMENTS,
        query,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'documents',
      path: '/api/v1/documents/list',
      method: 'GET',
      category: WbTokenCategory.DOCUMENTS,
      query,
    });
  }

  async downloadDocuments(storeId: string, params: Record<string, unknown>[]) {
    ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'documents',
      path: '/api/v1/documents/download/all',
      method: 'POST',
      category: WbTokenCategory.DOCUMENTS,
      body: { params },
    });
  }
}
