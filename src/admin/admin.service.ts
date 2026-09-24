import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  OnApplicationBootstrap,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { hashData } from '../common/utils';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class AdminService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    await this.seedInitialLeadAdmin();
  }

  async seedInitialLeadAdmin() {
    const existingLeadAdmin = await this.prisma.user.findFirst({
      where: { role: Role.LEAD_ADMIN },
    });

    if (existingLeadAdmin) {
      return;
    }

    const username = (
      this.configService.get<string>('INITIAL_ADMIN_USERNAME') || 'admin'
    )
      .trim()
      .toLowerCase();
    const password =
      this.configService.get<string>('INITIAL_ADMIN_PASSWORD') ||
      'admin_secure_password_change_me';

    const hashedPassword = await hashData(password);
    const leadAdmin = await this.prisma.user.upsert({
      where: { username },
      update: {
        password: hashedPassword,
        role: Role.LEAD_ADMIN,
      },
      create: {
        username,
        password: hashedPassword,
        role: Role.LEAD_ADMIN,
      },
    });

    this.logger.log(
      `Initial LEAD_ADMIN bootstrap completed: ${leadAdmin.username}`,
    );
    return leadAdmin;
  }

  async createAdmin(dto: CreateAdminDto) {
    const username = dto.username.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new ConflictException('Пользователь с таким именем уже существует');
    }

    const hashedPassword = await hashData(dto.password);
    const admin = await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: Role.ADMIN,
      },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return admin;
  }

  async deleteAdmin(adminId: string, currentUserId: string) {
    if (adminId === currentUserId) {
      throw new BadRequestException('Нельзя удалить самого себя');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!user) {
      throw new NotFoundException('Администратор не найден');
    }

    if (user.role === Role.LEAD_ADMIN) {
      throw new BadRequestException(
        'Нельзя удалить главного администратора (LEAD_ADMIN)',
      );
    }

    await this.prisma.user.delete({
      where: { id: adminId },
    });

    return { message: 'Администратор успешно удален' };
  }

  async getAdmins() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}
