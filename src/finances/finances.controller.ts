import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { FinancesService } from './finances.service';
import { SalesReportsListDto } from './dto/sales-reports.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Finances')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.LEAD_ADMIN, Role.ADMIN)
@Controller('finances')
export class FinancesController {
  constructor(private readonly financesService: FinancesService) {}

  @Get('balance')
  async getBalance(@Query('storeId') storeId?: string) {
    return this.financesService.getBalance(storeId);
  }

  @Post('sales-reports')
  async getSalesReportsList(@Body() dto: SalesReportsListDto) {
    return this.financesService.getSalesReportsList(dto);
  }

  @Post('sales-reports/detailed/:reportId')
  async getDetailedSalesReport(
    @Query('storeId') storeId: string,
    @Param('reportId', ParseIntPipe) reportId: number,
  ) {
    return this.financesService.getDetailedSalesReport(storeId, reportId);
  }

  @Post('acquiring')
  async getAcquiringList(@Body() dto: SalesReportsListDto) {
    return this.financesService.getAcquiringList(dto);
  }

  @Get('documents/categories')
  async getDocumentCategories(@Query('storeId') storeId?: string) {
    return this.financesService.getDocumentCategories(storeId);
  }

  @Get('documents')
  async getDocumentsList(
    @Query('storeId') storeId?: string,
    @Query('category') category?: string,
  ) {
    return this.financesService.getDocumentsList(storeId, category);
  }

  @Post('documents/download')
  async downloadDocuments(
    @Query('storeId') storeId: string,
    @Body('params') params: Record<string, unknown>[],
  ) {
    return this.financesService.downloadDocuments(storeId, params);
  }
}
