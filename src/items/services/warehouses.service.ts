import { Injectable } from '@nestjs/common';
import { WbTokenCategory } from '@prisma/client';
import { WbClientService } from '../../wb-client/wb-client.service';
import { ensureStoreId } from '../../common/utils';
import {
  CreateWarehouseDto,
  UpdateWarehouseDto,
  UpdateStocksDto,
} from '../dto';

@Injectable()
export class WarehousesService {
  constructor(private readonly wbClient: WbClientService) {}

  async getWarehouses(storeId?: string) {
    return this.wbClient.requestOrAll({
      storeId,
      service: 'marketplace',
      path: '/api/v3/warehouses',
      method: 'GET',
      category: WbTokenCategory.MARKETPLACE,
    });
  }

  async createWarehouse(storeId: string, dto: CreateWarehouseDto) {
    ensureStoreId(storeId);
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
    ensureStoreId(storeId);
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
    ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'marketplace',
      path: `/api/v3/warehouses/${warehouseId}`,
      method: 'DELETE',
      category: WbTokenCategory.MARKETPLACE,
    });
  }

  async getOffices(storeId: string) {
    ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'marketplace',
      path: '/api/v3/offices',
      method: 'GET',
      category: WbTokenCategory.MARKETPLACE,
    });
  }

  async getStocks(storeId: string, warehouseId: number, skus: string[]) {
    ensureStoreId(storeId);
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
    ensureStoreId(storeId);
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
    ensureStoreId(storeId);
    return this.wbClient.request({
      storeId,
      service: 'marketplace',
      path: `/api/v3/stocks/${warehouseId}`,
      method: 'DELETE',
      category: WbTokenCategory.MARKETPLACE,
      body: { skus },
    });
  }
}
