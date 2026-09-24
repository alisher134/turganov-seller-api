import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { StoresService } from './stores.service';
import { CreateStoreDto, UpdateStoreDto, CreateTokenDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Roles(Role.LEAD_ADMIN)
  @Post()
  async createStore(@Body() dto: CreateStoreDto) {
    return this.storesService.createStore(dto);
  }

  @Roles(Role.LEAD_ADMIN, Role.ADMIN)
  @Get()
  async findAllStores() {
    return this.storesService.findAllStores();
  }

  @Roles(Role.LEAD_ADMIN, Role.ADMIN)
  @Get('ping-all')
  async pingAllStores() {
    return this.storesService.pingAllStores();
  }

  @Roles(Role.LEAD_ADMIN, Role.ADMIN)
  @Get(':id')
  async findStoreById(@Param('id') id: string) {
    return this.storesService.findStoreById(id);
  }

  @Roles(Role.LEAD_ADMIN)
  @Patch(':id')
  async updateStore(@Param('id') id: string, @Body() dto: UpdateStoreDto) {
    return this.storesService.updateStore(id, dto);
  }

  @Roles(Role.LEAD_ADMIN)
  @Delete(':id')
  async deleteStore(@Param('id') id: string) {
    return this.storesService.deleteStore(id);
  }

  @Roles(Role.LEAD_ADMIN)
  @Post(':id/tokens')
  async addOrUpdateToken(
    @Param('id') storeId: string,
    @Body() dto: CreateTokenDto,
  ) {
    return this.storesService.addOrUpdateToken(storeId, dto);
  }

  @Roles(Role.LEAD_ADMIN)
  @Delete(':id/tokens/:tokenId')
  async removeToken(
    @Param('id') storeId: string,
    @Param('tokenId') tokenId: string,
  ) {
    return this.storesService.removeToken(storeId, tokenId);
  }

  @Roles(Role.LEAD_ADMIN, Role.ADMIN)
  @Get(':id/ping')
  async pingStore(@Param('id') storeId: string) {
    return this.storesService.pingStore(storeId);
  }
}
