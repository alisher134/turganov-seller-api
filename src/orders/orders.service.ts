import { Injectable } from '@nestjs/common';
import { GetOrdersDto, GetStickersDto } from './dto';
import {
  FbsOrdersService,
  DbsOrdersService,
  SuppliesService,
} from './services';

/**
 * Facade service for Orders module.
 * Coordinates FbsOrdersService, DbsOrdersService, and SuppliesService.
 */
@Injectable()
export class OrdersService {
  constructor(
    private readonly fbsOrdersService: FbsOrdersService,
    private readonly dbsOrdersService: DbsOrdersService,
    private readonly suppliesService: SuppliesService,
  ) {}

  // -------------------------------------------------------------
  // FBS Orders
  // -------------------------------------------------------------

  getNewFbsOrders(storeId?: string) {
    return this.fbsOrdersService.getNewFbsOrders(storeId);
  }

  getFbsOrders(dto: GetOrdersDto) {
    return this.fbsOrdersService.getFbsOrders(dto);
  }

  getFbsOrderStatuses(storeId: string, orders: number[]) {
    return this.fbsOrdersService.getFbsOrderStatuses(storeId, orders);
  }

  getFbsStickers(storeId: string, dto: GetStickersDto) {
    return this.fbsOrdersService.getFbsStickers(storeId, dto);
  }

  cancelFbsOrder(storeId: string, orderId: number) {
    return this.fbsOrdersService.cancelFbsOrder(storeId, orderId);
  }

  getFbsSupplies(storeId?: string, limit: number = 100, next: number = 0) {
    return this.fbsOrdersService.getFbsSupplies(storeId, limit, next);
  }

  getPasses(storeId?: string) {
    return this.fbsOrdersService.getPasses(storeId);
  }

  // -------------------------------------------------------------
  // DBW Orders
  // -------------------------------------------------------------

  getNewDbwOrders(storeId?: string) {
    return this.dbsOrdersService.getNewDbwOrders(storeId);
  }

  getDbwOrders(dto: GetOrdersDto) {
    return this.dbsOrdersService.getDbwOrders(dto);
  }

  confirmDbwOrder(storeId: string, orderId: number) {
    return this.dbsOrdersService.confirmDbwOrder(storeId, orderId);
  }

  // -------------------------------------------------------------
  // DBS Orders
  // -------------------------------------------------------------

  getNewDbsOrders(storeId?: string) {
    return this.dbsOrdersService.getNewDbsOrders(storeId);
  }

  getDbsOrders(dto: GetOrdersDto) {
    return this.dbsOrdersService.getDbsOrders(dto);
  }

  confirmDbsOrders(storeId: string, orderIds: number[]) {
    return this.dbsOrdersService.confirmDbsOrders(storeId, orderIds);
  }

  deliverDbsOrders(storeId: string, orderIds: number[]) {
    return this.dbsOrdersService.deliverDbsOrders(storeId, orderIds);
  }

  // -------------------------------------------------------------
  // Click & Collect (In-Store Pickup)
  // -------------------------------------------------------------

  getNewPickupOrders(storeId?: string) {
    return this.dbsOrdersService.getNewPickupOrders(storeId);
  }

  getPickupOrders(dto: GetOrdersDto) {
    return this.dbsOrdersService.getPickupOrders(dto);
  }

  // -------------------------------------------------------------
  // FBW Supplies
  // -------------------------------------------------------------

  getFbwSupplies(storeId?: string, limit: number = 100, next: number = 0) {
    return this.suppliesService.getFbwSupplies(storeId, limit, next);
  }

  createFbwSupply(storeId: string, name: string) {
    return this.suppliesService.createFbwSupply(storeId, name);
  }

  getFbwSupply(storeId: string, supplyId: string) {
    return this.suppliesService.getFbwSupply(storeId, supplyId);
  }

  getFbwSupplyGoods(
    storeId: string,
    supplyId: string,
    limit: number = 100,
    offset: number = 0,
  ) {
    return this.suppliesService.getFbwSupplyGoods(
      storeId,
      supplyId,
      limit,
      offset,
    );
  }

  getFbwDrafts(storeId?: string, limit: number = 100, offset: number = 0) {
    return this.suppliesService.getFbwDrafts(storeId, limit, offset);
  }
}
