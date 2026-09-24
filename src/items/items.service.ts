import { Injectable, BadRequestException } from '@nestjs/common';
import { WbTokenCategory } from '@prisma/client';
import { WbClientService } from '../wb-client/wb-client.service';
import {
  GetCardsDto,
  UploadPricesDto,
  UpdateStocksDto,
  CreateWarehouseDto,
  UpdateWarehouseDto,
} from './dto';

@Injectable()
export class ItemsService {
  constructor(private readonly wbClient: WbClientService) {}

  // -------------------------------------------------------------
  // Product Cards
  // -------------------------------------------------------------

  async getCards(dto: GetCardsDto) {
    const { storeId, settings } = dto;
    const body = {
      settings: settings || {
        cursor: { limit: 100 },
        filter: { withPhoto: -1 },
      },
    };

    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'content',
        path: '/content/v2/get/cards/list',
        method: 'POST',
        category: WbTokenCategory.CONTENT,
        body,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'content',
      path: '/content/v2/get/cards/list',
      method: 'POST',
      category: WbTokenCategory.CONTENT,
      body,
    });
  }

  async createCard(storeId: string, cards: any[]) {
    this.ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'content',
      path: '/content/v2/cards/upload',
      method: 'POST',
      category: WbTokenCategory.CONTENT,
      body: cards,
    });
  }

  async updateCard(storeId: string, cards: any[]) {
    this.ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'content',
      path: '/content/v2/cards/update',
      method: 'POST',
      category: WbTokenCategory.CONTENT,
      body: cards,
    });
  }

  async getCardLimits(storeId?: string) {
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'content',
        path: '/content/v2/cards/limits',
        method: 'GET',
        category: WbTokenCategory.CONTENT,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'content',
      path: '/content/v2/cards/limits',
      method: 'GET',
      category: WbTokenCategory.CONTENT,
    });
  }

  async getCardErrors(storeId?: string, locale: string = 'ru') {
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'content',
        path: '/content/v2/cards/error/list',
        method: 'GET',
        category: WbTokenCategory.CONTENT,
        query: { locale },
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'content',
      path: '/content/v2/cards/error/list',
      method: 'GET',
      category: WbTokenCategory.CONTENT,
      query: { locale },
    });
  }

  async generateBarcodes(storeId: string, count: number = 1) {
    this.ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'content',
      path: '/content/v2/barcodes',
      method: 'POST',
      category: WbTokenCategory.CONTENT,
      body: { count },
    });
  }

  // -------------------------------------------------------------
  // Prices and Discounts
  // -------------------------------------------------------------

  async getPrices(
    storeId?: string,
    limit: number = 100,
    offset: number = 0,
    filterNmId?: number,
  ) {
    const query: Record<string, any> = { limit, offset };
    if (filterNmId) query.filterNmID = filterNmId;

    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'prices',
        path: '/api/v2/list/goods/filter',
        method: 'GET',
        category: WbTokenCategory.PRICES,
        query,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'prices',
      path: '/api/v2/list/goods/filter',
      method: 'GET',
      category: WbTokenCategory.PRICES,
      query,
    });
  }

  async uploadPrices(storeId: string, dto: UploadPricesDto) {
    this.ensureStoreId(storeId);
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
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'prices',
        path: '/api/v2/history/tasks',
        method: 'GET',
        category: WbTokenCategory.PRICES,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'prices',
      path: '/api/v2/history/tasks',
      method: 'GET',
      category: WbTokenCategory.PRICES,
    });
  }

  // -------------------------------------------------------------
  // Warehouses and Stocks
  // -------------------------------------------------------------

  async getWarehouses(storeId?: string) {
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'marketplace',
        path: '/api/v3/warehouses',
        method: 'GET',
        category: WbTokenCategory.MARKETPLACE,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'marketplace',
      path: '/api/v3/warehouses',
      method: 'GET',
      category: WbTokenCategory.MARKETPLACE,
    });
  }

  async createWarehouse(storeId: string, dto: CreateWarehouseDto) {
    this.ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'marketplace',
      path: '/api/v3/warehouses',
      method: 'POST',
      category: WbTokenCategory.MARKETPLACE,
      body: dto,
    });
  }

  async updateWarehouse(
    storeId: string,
    warehouseId: number,
    dto: UpdateWarehouseDto,
  ) {
    this.ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'marketplace',
      path: `/api/v3/warehouses/${warehouseId}`,
      method: 'PUT',
      category: WbTokenCategory.MARKETPLACE,
      body: dto,
    });
  }

  async deleteWarehouse(storeId: string, warehouseId: number) {
    this.ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'marketplace',
      path: `/api/v3/warehouses/${warehouseId}`,
      method: 'DELETE',
      category: WbTokenCategory.MARKETPLACE,
    });
  }

  async getOffices(storeId: string) {
    this.ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'marketplace',
      path: '/api/v3/offices',
      method: 'GET',
      category: WbTokenCategory.MARKETPLACE,
    });
  }

  async getStocks(storeId: string, warehouseId: number, skus: string[]) {
    this.ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'marketplace',
      path: `/api/v3/stocks/${warehouseId}`,
      method: 'POST',
      category: WbTokenCategory.MARKETPLACE,
      body: { skus },
    });
  }

  async updateStocks(
    storeId: string,
    warehouseId: number,
    dto: UpdateStocksDto,
  ) {
    this.ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'marketplace',
      path: `/api/v3/stocks/${warehouseId}`,
      method: 'PUT',
      category: WbTokenCategory.MARKETPLACE,
      body: dto,
    });
  }

  async deleteStocks(storeId: string, warehouseId: number, skus: string[]) {
    this.ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'marketplace',
      path: `/api/v3/stocks/${warehouseId}`,
      method: 'DELETE',
      category: WbTokenCategory.MARKETPLACE,
      body: { skus },
    });
  }

  // -------------------------------------------------------------
  // Categories and Directories
  // -------------------------------------------------------------

  async getParentCategories(storeId?: string, locale: string = 'ru') {
    return this.callDirectory(storeId, '/content/v2/object/parent/all', 'GET', {
      locale,
    });
  }

  async getAllCategories(
    storeId?: string,
    name?: string,
    limit: number = 1000,
    locale: string = 'ru',
  ) {
    const query: Record<string, any> = { limit, locale };
    if (name) query.name = name;
    return this.callDirectory(storeId, '/content/v2/object/all', 'GET', query);
  }

  async getCharacteristics(
    storeId: string,
    subjectId: number,
    locale: string = 'ru',
  ) {
    this.ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'content',
      path: `/content/v2/object/charcs/${subjectId}`,
      method: 'GET',
      category: WbTokenCategory.CONTENT,
      query: { locale },
    });
  }

  async getColors(storeId?: string, locale: string = 'ru') {
    return this.callDirectory(storeId, '/content/v2/directory/colors', 'GET', {
      locale,
    });
  }

  async getCountries(storeId?: string, locale: string = 'ru') {
    return this.callDirectory(
      storeId,
      '/content/v2/directory/countries',
      'GET',
      { locale },
    );
  }

  async getBrands(storeId?: string, search?: string) {
    const query: Record<string, any> = {};
    if (search) query.search = search;
    return this.callDirectory(storeId, '/api/content/v1/brands', 'GET', query);
  }

  // -------------------------------------------------------------
  // Tags
  // -------------------------------------------------------------

  async getTags(storeId: string) {
    this.ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'content',
      path: '/content/v2/tags',
      method: 'GET',
      category: WbTokenCategory.CONTENT,
    });
  }

  async createTag(storeId: string, body: any) {
    this.ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'content',
      path: '/content/v2/tag',
      method: 'POST',
      category: WbTokenCategory.CONTENT,
      body,
    });
  }

  async updateTag(storeId: string, id: number, body: any) {
    this.ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'content',
      path: `/content/v2/tag/${id}`,
      method: 'PATCH',
      category: WbTokenCategory.CONTENT,
      body,
    });
  }

  async deleteTag(storeId: string, id: number) {
    this.ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'content',
      path: `/content/v2/tag/${id}`,
      method: 'DELETE',
      category: WbTokenCategory.CONTENT,
    });
  }

  private async callDirectory(
    storeId?: string,
    path: string = '',
    method: 'GET' | 'POST' = 'GET',
    query?: Record<string, any>,
  ) {
    if (storeId && storeId !== 'all') {
      return this.wbClient.request({
        storeId,
        service: 'content',
        path,
        method,
        category: WbTokenCategory.CONTENT,
        query,
      });
    }

    return this.wbClient.executeForAllStores({
      service: 'content',
      path,
      method,
      category: WbTokenCategory.CONTENT,
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
