import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.LEAD_ADMIN, Role.ADMIN)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('orders')
  async getOrdersReport(
    @Query('storeId') storeId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('flag') flag?: string,
  ) {
    return this.reportsService.getOrdersReport(
      storeId,
      dateFrom,
      flag ? parseInt(flag, 10) : 0,
    );
  }

  @Get('sales')
  async getSalesReport(
    @Query('storeId') storeId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('flag') flag?: string,
  ) {
    return this.reportsService.getSalesReport(
      storeId,
      dateFrom,
      flag ? parseInt(flag, 10) : 0,
    );
  }

  @Get('warehouse-remains')
  async getWarehouseRemains(@Query('storeId') storeId?: string) {
    return this.reportsService.getWarehouseRemains(storeId);
  }

  @Get('paid-storage')
  async getPaidStorage(
    @Query('storeId') storeId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.reportsService.getPaidStorage(storeId, dateFrom, dateTo);
  }

  @Get('region-sales')
  async getRegionSales(
    @Query('storeId') storeId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.reportsService.getRegionSales(storeId, dateFrom, dateTo);
  }

  @Get('goods-return')
  async getGoodsReturn(
    @Query('storeId') storeId?: string,
    @Query('dateFrom') dateFrom?: string,
  ) {
    return this.reportsService.getGoodsReturn(storeId, dateFrom);
  }

  @Get('deductions')
  async getDeductions(
    @Query('storeId') storeId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.reportsService.getDeductions(storeId, dateFrom, dateTo);
  }
}
