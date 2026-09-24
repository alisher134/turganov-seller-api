import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcryptjs');

describe('AdminService', () => {
  let service: AdminService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      delete: jest.Mock;
      upsert: jest.Mock;
    };
  };
  let configService: {
    get: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        upsert: jest.fn(),
      },
    };

    configService = {
      get: jest.fn((key: string) => {
        const config: Record<string, string> = {
          INITIAL_ADMIN_USERNAME: 'admin',
          INITIAL_ADMIN_PASSWORD: 'admin_secure_password_change_me',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAdmin', () => {
    const createDto = {
      username: '  NewAdmin  ',
      password: 'password123',
    };

    it('should create and return new admin with role ADMIN', async () => {
      const createdAdmin = {
        id: 'admin-uuid-1',
        username: 'newadmin',
        role: Role.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      prisma.user.create.mockResolvedValue(createdAdmin);

      const result = await service.createAdmin(createDto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'newadmin' },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          username: 'newadmin',
          password: 'hashedPassword',
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
      expect(result).toEqual(createdAdmin);
    });

    it('should throw ConflictException when username is already taken', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing-id' });

      await expect(service.createAdmin(createDto)).rejects.toThrow(
        new ConflictException('Пользователь с таким именем уже существует'),
      );
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('deleteAdmin', () => {
    it('should throw BadRequestException when trying to delete oneself', async () => {
      await expect(
        service.deleteAdmin('same-user-id', 'same-user-id'),
      ).rejects.toThrow(new BadRequestException('Нельзя удалить самого себя'));
      expect(prisma.user.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when target admin does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteAdmin('non-existent-id', 'current-user-id'),
      ).rejects.toThrow(new NotFoundException('Администратор не найден'));
    });

    it('should throw BadRequestException when trying to delete LEAD_ADMIN', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'lead-admin-id',
        role: Role.LEAD_ADMIN,
      });

      await expect(
        service.deleteAdmin('lead-admin-id', 'current-user-id'),
      ).rejects.toThrow(
        new BadRequestException(
          'Нельзя удалить главного администратора (LEAD_ADMIN)',
        ),
      );
      expect(prisma.user.delete).not.toHaveBeenCalled();
    });

    it('should successfully delete an admin', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'admin-id-1',
        role: Role.ADMIN,
      });
      prisma.user.delete.mockResolvedValue({ id: 'admin-id-1' });

      const result = await service.deleteAdmin('admin-id-1', 'current-user-id');

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'admin-id-1' },
      });
      expect(result).toEqual({ message: 'Администратор успешно удален' });
    });
  });

  describe('getAdmins', () => {
    it('should return a list of admins', async () => {
      const admins = [
        {
          id: 'lead-1',
          username: 'leadadmin',
          role: Role.LEAD_ADMIN,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'admin-1',
          username: 'admin1',
          role: Role.ADMIN,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prisma.user.findMany.mockResolvedValue(admins);

      const result = await service.getAdmins();

      expect(prisma.user.findMany).toHaveBeenCalledWith({
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
      expect(result).toEqual(admins);
    });
  });

  describe('seedInitialLeadAdmin', () => {
    it('should do nothing if a LEAD_ADMIN already exists', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'existing-lead',
        role: Role.LEAD_ADMIN,
      });

      await service.onApplicationBootstrap();

      expect(prisma.user.upsert).not.toHaveBeenCalled();
    });

    it('should create initial LEAD_ADMIN if none exists', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      prisma.user.upsert.mockResolvedValue({
        id: 'new-lead-id',
        username: 'admin',
        role: Role.LEAD_ADMIN,
      });

      await service.onApplicationBootstrap();

      expect(bcrypt.hash).toHaveBeenCalledWith(
        'admin_secure_password_change_me',
        10,
      );
      expect(prisma.user.upsert).toHaveBeenCalledWith({
        where: { username: 'admin' },
        update: {
          password: 'hashedPassword',
          role: Role.LEAD_ADMIN,
        },
        create: {
          username: 'admin',
          password: 'hashedPassword',
          role: Role.LEAD_ADMIN,
        },
      });
    });
  });
});
