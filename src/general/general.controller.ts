import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { GeneralService } from './general.service';
import { GetNewsDto } from './dto/get-news.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('General')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('general')
export class GeneralController {
  constructor(private readonly generalService: GeneralService) {}

  @Roles(Role.LEAD_ADMIN, Role.ADMIN)
  @Get('ping')
  async ping(@Query('storeId') storeId?: string) {
    return this.generalService.ping(storeId);
  }

  @Roles(Role.LEAD_ADMIN, Role.ADMIN)
  @Get('seller-info')
  async getSellerInfo(@Query('storeId') storeId?: string) {
    return this.generalService.getSellerInfo(storeId);
  }

  @Roles(Role.LEAD_ADMIN, Role.ADMIN)
  @Get('rating')
  async getRating(@Query('storeId') storeId?: string) {
    return this.generalService.getRating(storeId);
  }

  @Roles(Role.LEAD_ADMIN, Role.ADMIN)
  @Get('news')
  async getNews(@Query() dto: GetNewsDto) {
    return this.generalService.getNews(dto);
  }

  @Roles(Role.LEAD_ADMIN, Role.ADMIN)
  @Get('subscriptions')
  async getSubscriptions(@Query('storeId') storeId?: string) {
    return this.generalService.getSubscriptions(storeId);
  }

  @Roles(Role.LEAD_ADMIN, Role.ADMIN)
  @Get('tariff-constructor-options')
  async getTariffConstructorOptions(@Query('storeId') storeId?: string) {
    return this.generalService.getTariffConstructorOptions(storeId);
  }

  @Roles(Role.LEAD_ADMIN)
  @Get('users')
  async getWbUsers(
    @Query('storeId') storeId: string,
    @Query('isInviteOnly') isInviteOnly?: string,
  ) {
    const isInvite =
      isInviteOnly === 'true'
        ? true
        : isInviteOnly === 'false'
          ? false
          : undefined;
    return this.generalService.getWbUsers(storeId, isInvite);
  }

  @Roles(Role.LEAD_ADMIN)
  @Post('invite')
  async inviteWbUser(
    @Query('storeId') storeId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.generalService.inviteWbUser(storeId, body);
  }

  @Roles(Role.LEAD_ADMIN)
  @Delete('user/:userId')
  async deleteWbUser(
    @Query('storeId') storeId: string,
    @Param('userId') userId: string,
  ) {
    return this.generalService.deleteWbUser(storeId, userId);
  }
}
