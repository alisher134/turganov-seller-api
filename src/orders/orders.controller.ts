import {
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { OrdersService } from './orders.service';
import { GetOrdersDto, GetStickersDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.LEAD_ADMIN, Role.ADMIN)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // -------------------------------------------------------------
  // FBS Orders
  // -------------------------------------------------------------

  @Get('fbs/new')
  async getNewFbsOrders(@Query('storeId') storeId?: string) {
    return this.ordersService.getNewFbsOrders(storeId);
  }

  @Get('fbs')
  async getFbsOrders(@Query() dto: GetOrdersDto) {
    return this.ordersService.getFbsOrders(dto);
  }

  @Post('fbs/status')
  async getFbsOrderStatuses(
    @Query('storeId') storeId: string,
    @Body('orders') orders: number[],
  ) {
    return this.ordersService.getFbsOrderStatuses(storeId, orders);
  }

  @Post('fbs/stickers')
  async getFbsStickers(
    @Query('storeId') storeId: string,
    @Body() dto: GetStickersDto,
  ) {
    return this.ordersService.getFbsStickers(storeId, dto);
  }

  @Patch('fbs/:id/cancel')
  async cancelFbsOrder(
    @Query('storeId') storeId: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.cancelFbsOrder(storeId, id);
  }

  @Get('fbs/supplies')
  async getFbsSupplies(
    @Query('storeId') storeId?: string,
    @Query('limit') limit?: string,
    @Query('next') next?: string,
  ) {
    return this.ordersService.getFbsSupplies(
      storeId,
      limit ? parseInt(limit, 10) : 100,
      next ? parseInt(next, 10) : 0,
    );
  }

  @Get('fbs/passes')
  async getPasses(@Query('storeId') storeId?: string) {
    return this.ordersService.getPasses(storeId);
  }

  // -------------------------------------------------------------
  // DBW Orders
  // -------------------------------------------------------------

  @Get('dbw/new')
  async getNewDbwOrders(@Query('storeId') storeId?: string) {
    return this.ordersService.getNewDbwOrders(storeId);
  }

  @Get('dbw')
  async getDbwOrders(@Query() dto: GetOrdersDto) {
    return this.ordersService.getDbwOrders(dto);
  }

  @Patch('dbw/:id/confirm')
  async confirmDbwOrder(
    @Query('storeId') storeId: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.confirmDbwOrder(storeId, id);
  }

  // -------------------------------------------------------------
  // DBS Orders
  // -------------------------------------------------------------

  @Get('dbs/new')
  async getNewDbsOrders(@Query('storeId') storeId?: string) {
    return this.ordersService.getNewDbsOrders(storeId);
  }

  @Get('dbs')
  async getDbsOrders(@Query() dto: GetOrdersDto) {
    return this.ordersService.getDbsOrders(dto);
  }

  @Post('dbs/confirm')
  async confirmDbsOrders(
    @Query('storeId') storeId: string,
    @Body('orders') orderIds: number[],
  ) {
    return this.ordersService.confirmDbsOrders(storeId, orderIds);
  }

  @Post('dbs/deliver')
  async deliverDbsOrders(
    @Query('storeId') storeId: string,
    @Body('orders') orderIds: number[],
  ) {
    return this.ordersService.deliverDbsOrders(storeId, orderIds);
  }

  // -------------------------------------------------------------
  // In-Store Pickup
  // -------------------------------------------------------------

  @Get('pickup/new')
  async getNewPickupOrders(@Query('storeId') storeId?: string) {
    return this.ordersService.getNewPickupOrders(storeId);
  }

  @Get('pickup')
  async getPickupOrders(@Query() dto: GetOrdersDto) {
    return this.ordersService.getPickupOrders(dto);
  }

  // -------------------------------------------------------------
  // FBW Supplies
  // -------------------------------------------------------------

  @Get('fbw/supplies')
  async getFbwSupplies(
    @Query('storeId') storeId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.ordersService.getFbwSupplies(
      storeId,
      limit ? parseInt(limit, 10) : 100,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('fbw/supplies/:id')
  async getFbwSupply(
    @Query('storeId') storeId: string,
    @Param('id') id: string,
  ) {
    return this.ordersService.getFbwSupply(storeId, id);
  }

  @Get('fbw/supplies/:id/goods')
  async getFbwSupplyGoods(
    @Query('storeId') storeId: string,
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.ordersService.getFbwSupplyGoods(
      storeId,
      id,
      limit ? parseInt(limit, 10) : 100,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('fbw/drafts')
  async getFbwDrafts(
    @Query('storeId') storeId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.ordersService.getFbwDrafts(
      storeId,
      limit ? parseInt(limit, 10) : 100,
      offset ? parseInt(offset, 10) : 0,
    );
  }
}
