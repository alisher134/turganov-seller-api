import {
  Controller,
  Post,
  Get,
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
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Admins')
@ApiBearerAuth('JWT-auth')
@Controller(['admins', 'auth/admins'])
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LEAD_ADMIN)
  @ApiOperation({ summary: 'Create new administrator (LEAD_ADMIN only)' })
  @ApiResponse({ status: 201, description: 'Admin successfully created' })
  @ApiResponse({ status: 400, description: 'Validation error or email taken' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Post()
  async createAdmin(@Body() dto: CreateAdminDto) {
    return this.adminService.createAdmin(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LEAD_ADMIN)
  @ApiOperation({ summary: 'Delete administrator by ID (LEAD_ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Admin successfully deleted' })
  @ApiResponse({ status: 400, description: 'Cannot delete own account' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  @Delete(':id')
  async deleteAdmin(
    @Param('id') id: string,
    @CurrentUser('id') currentUserId: string,
  ) {
    return this.adminService.deleteAdmin(id, currentUserId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LEAD_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Get list of administrators' })
  @ApiResponse({ status: 200, description: 'List of admins' })
  @Get()
  async getAdmins() {
    return this.adminService.getAdmins();
  }
}
