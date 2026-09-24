import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PromotionService } from './promotion.service';
import { GetAdvertsDto } from './dto/get-adverts.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.LEAD_ADMIN, Role.ADMIN)
@Controller('promotion')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Get('count')
  async getPromotionCount(@Query('storeId') storeId?: string) {
    return this.promotionService.getPromotionCount(storeId);
  }

  @Get('adverts')
  async getAdverts(@Query() dto: GetAdvertsDto) {
    return this.promotionService.getAdverts(dto);
  }

  @Get('balance')
  async getBalance(@Query('storeId') storeId?: string) {
    return this.promotionService.getBalance(storeId);
  }

  @Get('budget')
  async getBudget(
    @Query('storeId') storeId: string,
    @Query('id', ParseIntPipe) campaignId: number,
  ) {
    return this.promotionService.getBudget(storeId, campaignId);
  }

  @Post('start')
  async startCampaign(
    @Query('storeId') storeId: string,
    @Body('id', ParseIntPipe) campaignId: number,
  ) {
    return this.promotionService.startCampaign(storeId, campaignId);
  }

  @Post('pause')
  async pauseCampaign(
    @Query('storeId') storeId: string,
    @Body('id', ParseIntPipe) campaignId: number,
  ) {
    return this.promotionService.pauseCampaign(storeId, campaignId);
  }

  @Post('stop')
  async stopCampaign(
    @Query('storeId') storeId: string,
    @Body('id', ParseIntPipe) campaignId: number,
  ) {
    return this.promotionService.stopCampaign(storeId, campaignId);
  }

  @Post('stats')
  async getFullStats(
    @Query('storeId') storeId: string,
    @Body('dates') dates: string[],
  ) {
    return this.promotionService.getFullStats(storeId, dates);
  }

  @Get('calendar')
  async getPromotionsCalendar(@Query('storeId') storeId?: string) {
    return this.promotionService.getPromotionsCalendar(storeId);
  }
}
