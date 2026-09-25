import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AnalyticsService } from './analytics.service';
import { SalesFunnelDto } from './dto/sales-funnel.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Analytics')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.LEAD_ADMIN, Role.ADMIN)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('sales-funnel')
  async getSalesFunnel(@Body() dto: SalesFunnelDto) {
    return this.analyticsService.getSalesFunnel(dto);
  }

  @Post('sales-funnel/history')
  async getSalesFunnelHistory(@Body() dto: SalesFunnelDto) {
    return this.analyticsService.getSalesFunnelHistory(dto);
  }

  @Get('order-feed')
  async getOrderFeed(@Query('storeId') storeId?: string) {
    return this.analyticsService.getOrderFeed(storeId);
  }

  @Post('search-report')
  async getSearchReport(
    @Query('storeId') storeId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.analyticsService.getSearchReport(storeId, body);
  }

  @Post('stocks/wb')
  async getWbWarehouseStocks(
    @Query('storeId') storeId?: string,
    @Body() body?: Record<string, unknown>,
  ) {
    return this.analyticsService.getWbWarehouseStocks(storeId, body);
  }

  @Post('stocks/seller')
  async getSellerWarehouseStocks(
    @Query('storeId') storeId?: string,
    @Body() body?: Record<string, unknown>,
  ) {
    return this.analyticsService.getSellerWarehouseStocks(storeId, body);
  }

  @Post('item-rating')
  async getItemRating(
    @Query('storeId') storeId?: string,
    @Body() body?: Record<string, unknown>,
  ) {
    return this.analyticsService.getItemRating(storeId, body);
  }
}
