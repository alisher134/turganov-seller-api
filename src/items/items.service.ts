import { Injectable } from '@nestjs/common';
import {
  GetCardsDto,
  UploadPricesDto,
  UpdateStocksDto,
  CreateWarehouseDto,
  UpdateWarehouseDto,
} from './dto';
import {
  CardsService,
  PricesService,
  WarehousesService,
  ContentDirectoriesService,
} from './services';

/**
 * Facade service for Items module.
 * Coordinates CardsService, PricesService, WarehousesService, and ContentDirectoriesService.
 */
@Injectable()
export class ItemsService {
  constructor(
    private readonly cardsService: CardsService,
    private readonly pricesService: PricesService,
    private readonly warehousesService: WarehousesService,
    private readonly contentDirectoriesService: ContentDirectoriesService,
  ) {}

  // -------------------------------------------------------------
  // Product Cards
  // -------------------------------------------------------------

  getCards(dto: GetCardsDto) {
    return this.cardsService.getCards(dto);
  }

  createCard(storeId: string, cards: Record<string, unknown>[]) {
    return this.cardsService.createCard(storeId, cards);
  }

  updateCard(storeId: string, cards: Record<string, unknown>[]) {
    return this.cardsService.updateCard(storeId, cards);
  }

  getCardLimits(storeId?: string) {
    return this.cardsService.getCardLimits(storeId);
  }

  getCardErrors(storeId?: string, locale: string = 'ru') {
    return this.cardsService.getCardErrors(storeId, locale);
  }

  generateBarcodes(storeId: string, count: number = 1) {
    return this.cardsService.generateBarcodes(storeId, count);
  }

  // -------------------------------------------------------------
  // Prices and Discounts
  // -------------------------------------------------------------

  getPrices(
    storeId?: string,
    limit: number = 100,
    offset: number = 0,
    filterNmId?: number,
  ) {
    return this.pricesService.getPrices(storeId, limit, offset, filterNmId);
  }

  uploadPrices(storeId: string, dto: UploadPricesDto) {
    return this.pricesService.uploadPrices(storeId, dto);
  }

  getPriceUploadTasks(storeId?: string) {
    return this.pricesService.getPriceUploadTasks(storeId);
  }

  // -------------------------------------------------------------
  // Warehouses and Stocks
  // -------------------------------------------------------------

  getWarehouses(storeId?: string) {
    return this.warehousesService.getWarehouses(storeId);
  }

  createWarehouse(storeId: string, dto: CreateWarehouseDto) {
    return this.warehousesService.createWarehouse(storeId, dto);
  }

  updateWarehouse(
    storeId: string,
    warehouseId: number,
    dto: UpdateWarehouseDto,
  ) {
    return this.warehousesService.updateWarehouse(storeId, warehouseId, dto);
  }

  deleteWarehouse(storeId: string, warehouseId: number) {
    return this.warehousesService.deleteWarehouse(storeId, warehouseId);
  }

  getOffices(storeId: string) {
    return this.warehousesService.getOffices(storeId);
  }

  getStocks(storeId: string, warehouseId: number, skus: string[]) {
    return this.warehousesService.getStocks(storeId, warehouseId, skus);
  }

  updateStocks(storeId: string, warehouseId: number, dto: UpdateStocksDto) {
    return this.warehousesService.updateStocks(storeId, warehouseId, dto);
  }

  deleteStocks(storeId: string, warehouseId: number, skus: string[]) {
    return this.warehousesService.deleteStocks(storeId, warehouseId, skus);
  }

  // -------------------------------------------------------------
  // Directories & Metadata
  // -------------------------------------------------------------

  getParentCategories(storeId?: string, locale: string = 'ru') {
    return this.contentDirectoriesService.getParentCategories(storeId, locale);
  }

  getSubjects(
    storeId?: string,
    name?: string,
    limit: number = 1000,
    offset: number = 0,
    parentId?: number,
  ) {
    return this.contentDirectoriesService.getSubjects(
      storeId,
      name,
      limit,
      offset,
      parentId,
    );
  }

  getAllCategories(
    storeId?: string,
    name?: string,
    limit: number = 1000,
    locale: string = 'ru',
  ) {
    return this.contentDirectoriesService.getAllCategories(
      storeId,
      name,
      limit,
      locale,
    );
  }

  getCharacteristics(
    storeId: string,
    subjectId: number,
    locale: string = 'ru',
  ) {
    return this.contentDirectoriesService.getCharacteristics(
      storeId,
      subjectId,
      locale,
    );
  }

  getColors(storeId?: string, locale: string = 'ru') {
    return this.contentDirectoriesService.getColors(storeId, locale);
  }

  getCountries(storeId?: string, locale: string = 'ru') {
    return this.contentDirectoriesService.getCountries(storeId, locale);
  }

  getBrands(storeId?: string, search?: string) {
    return this.contentDirectoriesService.getBrands(storeId, search);
  }

  // -------------------------------------------------------------
  // Tags
  // -------------------------------------------------------------

  getTags(storeId: string) {
    return this.contentDirectoriesService.getTags(storeId);
  }

  createTag(storeId: string, body: Record<string, unknown>) {
    return this.contentDirectoriesService.createTag(storeId, body);
  }

  updateTag(storeId: string, id: number, body: Record<string, unknown>) {
    return this.contentDirectoriesService.updateTag(storeId, id, body);
  }

  deleteTag(storeId: string, id: number) {
    return this.contentDirectoriesService.deleteTag(storeId, id);
  }
}
