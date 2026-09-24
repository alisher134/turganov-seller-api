import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Query,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { ItemsService } from './items.service';
import {
  GetCardsDto,
  UploadPricesDto,
  UpdateStocksDto,
  CreateWarehouseDto,
  UpdateWarehouseDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.LEAD_ADMIN, Role.ADMIN)
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  // -------------------------------------------------------------
  // Cards
  // -------------------------------------------------------------

  @Post('cards/list')
  async getCards(@Body() dto: GetCardsDto) {
    return this.itemsService.getCards(dto);
  }

  @Post('cards')
  async createCard(@Query('storeId') storeId: string, @Body() cards: any[]) {
    return this.itemsService.createCard(storeId, cards);
  }

  @Patch('cards')
  async updateCard(@Query('storeId') storeId: string, @Body() cards: any[]) {
    return this.itemsService.updateCard(storeId, cards);
  }

  @Get('cards/limits')
  async getCardLimits(@Query('storeId') storeId?: string) {
    return this.itemsService.getCardLimits(storeId);
  }

  @Get('cards/errors')
  async getCardErrors(
    @Query('storeId') storeId?: string,
    @Query('locale') locale?: string,
  ) {
    return this.itemsService.getCardErrors(storeId, locale);
  }

  @Post('cards/barcodes')
  async generateBarcodes(
    @Query('storeId') storeId: string,
    @Body('count') count?: number,
  ) {
    return this.itemsService.generateBarcodes(storeId, count);
  }

  // -------------------------------------------------------------
  // Prices
  // -------------------------------------------------------------

  @Get('prices')
  async getPrices(
    @Query('storeId') storeId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('filterNmID') filterNmId?: string,
  ) {
    return this.itemsService.getPrices(
      storeId,
      limit ? parseInt(limit, 10) : 100,
      offset ? parseInt(offset, 10) : 0,
      filterNmId ? parseInt(filterNmId, 10) : undefined,
    );
  }

  @Post('prices')
  async uploadPrices(
    @Query('storeId') storeId: string,
    @Body() dto: UploadPricesDto,
  ) {
    return this.itemsService.uploadPrices(storeId, dto);
  }

  @Get('prices/tasks')
  async getPriceUploadTasks(@Query('storeId') storeId?: string) {
    return this.itemsService.getPriceUploadTasks(storeId);
  }

  // -------------------------------------------------------------
  // Warehouses and Stocks
  // -------------------------------------------------------------

  @Get('warehouses')
  async getWarehouses(@Query('storeId') storeId?: string) {
    return this.itemsService.getWarehouses(storeId);
  }

  @Post('warehouses')
  async createWarehouse(
    @Query('storeId') storeId: string,
    @Body() dto: CreateWarehouseDto,
  ) {
    return this.itemsService.createWarehouse(storeId, dto);
  }

  @Put('warehouses/:id')
  async updateWarehouse(
    @Query('storeId') storeId: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWarehouseDto,
  ) {
    return this.itemsService.updateWarehouse(storeId, id, dto);
  }

  @Delete('warehouses/:id')
  async deleteWarehouse(
    @Query('storeId') storeId: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.itemsService.deleteWarehouse(storeId, id);
  }

  @Get('warehouses/offices')
  async getOffices(@Query('storeId') storeId: string) {
    return this.itemsService.getOffices(storeId);
  }

  @Post('stocks/:warehouseId')
  async getStocks(
    @Query('storeId') storeId: string,
    @Param('warehouseId', ParseIntPipe) warehouseId: number,
    @Body('skus') skus: string[],
  ) {
    return this.itemsService.getStocks(storeId, warehouseId, skus);
  }

  @Put('stocks/:warehouseId')
  async updateStocks(
    @Query('storeId') storeId: string,
    @Param('warehouseId', ParseIntPipe) warehouseId: number,
    @Body() dto: UpdateStocksDto,
  ) {
    return this.itemsService.updateStocks(storeId, warehouseId, dto);
  }

  @Delete('stocks/:warehouseId')
  async deleteStocks(
    @Query('storeId') storeId: string,
    @Param('warehouseId', ParseIntPipe) warehouseId: number,
    @Body('skus') skus: string[],
  ) {
    return this.itemsService.deleteStocks(storeId, warehouseId, skus);
  }

  // -------------------------------------------------------------
  // Directories & Categories
  // -------------------------------------------------------------

  @Get('directories/categories/parent')
  async getParentCategories(
    @Query('storeId') storeId?: string,
    @Query('locale') locale?: string,
  ) {
    return this.itemsService.getParentCategories(storeId, locale);
  }

  @Get('directories/categories/all')
  async getAllCategories(
    @Query('storeId') storeId?: string,
    @Query('name') name?: string,
    @Query('limit') limit?: string,
    @Query('locale') locale?: string,
  ) {
    return this.itemsService.getAllCategories(
      storeId,
      name,
      limit ? parseInt(limit, 10) : 1000,
      locale,
    );
  }

  @Get('directories/characteristics/:subjectId')
  async getCharacteristics(
    @Query('storeId') storeId: string,
    @Param('subjectId', ParseIntPipe) subjectId: number,
    @Query('locale') locale?: string,
  ) {
    return this.itemsService.getCharacteristics(storeId, subjectId, locale);
  }

  @Get('directories/colors')
  async getColors(
    @Query('storeId') storeId?: string,
    @Query('locale') locale?: string,
  ) {
    return this.itemsService.getColors(storeId, locale);
  }

  @Get('directories/countries')
  async getCountries(
    @Query('storeId') storeId?: string,
    @Query('locale') locale?: string,
  ) {
    return this.itemsService.getCountries(storeId, locale);
  }

  @Get('directories/brands')
  async getBrands(
    @Query('storeId') storeId?: string,
    @Query('search') search?: string,
  ) {
    return this.itemsService.getBrands(storeId, search);
  }

  // -------------------------------------------------------------
  // Tags
  // -------------------------------------------------------------

  @Get('tags')
  async getTags(@Query('storeId') storeId: string) {
    return this.itemsService.getTags(storeId);
  }

  @Post('tags')
  async createTag(@Query('storeId') storeId: string, @Body() body: any) {
    return this.itemsService.createTag(storeId, body);
  }

  @Patch('tags/:id')
  async updateTag(
    @Query('storeId') storeId: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.itemsService.updateTag(storeId, id, body);
  }

  @Delete('tags/:id')
  async deleteTag(
    @Query('storeId') storeId: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.itemsService.deleteTag(storeId, id);
  }
}
