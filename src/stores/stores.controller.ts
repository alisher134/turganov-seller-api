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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { StoresService } from './stores.service';
import { CreateStoreDto, UpdateStoreDto, CreateTokenDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Stores')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Roles(Role.LEAD_ADMIN)
  @ApiOperation({ summary: 'Create a new store (LEAD_ADMIN only)' })
  @ApiResponse({ status: 201, description: 'Store created successfully' })
  @Post()
  async createStore(@Body() dto: CreateStoreDto) {
    return this.storesService.createStore(dto);
  }

  @Roles(Role.LEAD_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'List all stores' })
  @ApiResponse({ status: 200, description: 'List of stores with tokens' })
  @Get()
  async findAllStores() {
    return this.storesService.findAllStores();
  }

  @Roles(Role.LEAD_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Ping all stores WB API connection' })
  @ApiResponse({ status: 200, description: 'Ping status per store' })
  @Get('ping-all')
  async pingAllStores() {
    return this.storesService.pingAllStores();
  }

  @Roles(Role.LEAD_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Find store by ID' })
  @ApiResponse({ status: 200, description: 'Store details' })
  @ApiResponse({ status: 404, description: 'Store not found' })
  @Get(':id')
  async findStoreById(@Param('id') id: string) {
    return this.storesService.findStoreById(id);
  }

  @Roles(Role.LEAD_ADMIN)
  @ApiOperation({ summary: 'Update store details (LEAD_ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Updated store' })
  @Patch(':id')
  async updateStore(@Param('id') id: string, @Body() dto: UpdateStoreDto) {
    return this.storesService.updateStore(id, dto);
  }

  @Roles(Role.LEAD_ADMIN)
  @ApiOperation({ summary: 'Delete store (LEAD_ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Store deleted' })
  @Delete(':id')
  async deleteStore(@Param('id') id: string) {
    return this.storesService.deleteStore(id);
  }

  @Roles(Role.LEAD_ADMIN)
  @ApiOperation({
    summary: 'Add or update store WB API token (LEAD_ADMIN only)',
  })
  @ApiResponse({ status: 201, description: 'Token added or updated' })
  @Post(':id/tokens')
  async addOrUpdateToken(
    @Param('id') storeId: string,
    @Body() dto: CreateTokenDto,
  ) {
    return this.storesService.addOrUpdateToken(storeId, dto);
  }

  @Roles(Role.LEAD_ADMIN)
  @ApiOperation({ summary: 'Remove store token by ID (LEAD_ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Token removed' })
  @Delete(':id/tokens/:tokenId')
  async removeToken(
    @Param('id') storeId: string,
    @Param('tokenId') tokenId: string,
  ) {
    return this.storesService.removeToken(storeId, tokenId);
  }

  @Roles(Role.LEAD_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Ping store WB API connection' })
  @ApiResponse({ status: 200, description: 'Connection status' })
  @Get(':id/ping')
  async pingStore(@Param('id') storeId: string) {
    return this.storesService.pingStore(storeId);
  }
}
