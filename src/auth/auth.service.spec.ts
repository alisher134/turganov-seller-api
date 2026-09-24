import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      count: jest.Mock;
    };
  };
  let jwtService: {
    signAsync: jest.Mock;
    verifyAsync: jest.Mock;
  };
  let configService: {
    get: jest.Mock;
    getOrThrow: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        count: jest.fn(),
      },
    };

    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    const config: Record<string, string> = {
      JWT_SECRET: 'test_access_secret',
      JWT_EXPIRES_IN: '1d',
      JWT_REFRESH_SECRET: 'test_refresh_secret',
      JWT_REFRESH_EXPIRES_IN: '7d',
    };

    configService = {
      get: jest.fn((key: string) => config[key]),
      getOrThrow: jest.fn((key: string) => {
        const val = config[key];
        if (!val) {
          throw new Error(`Missing config value for key: ${key}`);
        }
        return val;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    const signInDto = {
      username: '  TestUser  ',
      password: 'password123',
    };

    it('should authenticate existing user when credentials are correct', async () => {
      const existingUser = {
        id: 'user-uuid-1',
        username: 'testuser',
        password: 'hashedPassword',
        role: Role.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.user.findUnique.mockResolvedValue(existingUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync
        .mockResolvedValueOnce('access_token_123')
        .mockResolvedValueOnce('refresh_token_123');

      const result = await service.signIn(signInDto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword',
      );
      expect(result).toEqual({
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_123',
        user: {
          id: 'user-uuid-1',
          username: 'testuser',
          role: Role.ADMIN,
        },
      });
    });

    it('should throw UnauthorizedException when password does not match', async () => {
      const existingUser = {
        id: 'user-uuid-1',
        username: 'testuser',
        password: 'hashedPassword',
        role: Role.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.user.findUnique.mockResolvedValue(existingUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.signIn(signInDto)).rejects.toThrow(
        new UnauthorizedException('Неверный логин или пароль'),
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.signIn(signInDto)).rejects.toThrow(
        new UnauthorizedException('Неверный логин или пароль'),
      );
      expect(prisma.user.create).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('refreshTokens', () => {
    const refreshDto = { refreshToken: 'valid_refresh_token' };

    it('should issue new tokens when refresh token is valid and user exists', async () => {
      const payload = {
        sub: 'user-uuid-1',
        username: 'testuser',
        role: Role.ADMIN,
      };
      const user = {
        id: 'user-uuid-1',
        username: 'testuser',
        password: 'hashedPassword',
        role: Role.ADMIN,
      };

      jwtService.verifyAsync.mockResolvedValue(payload);
      prisma.user.findUnique.mockResolvedValue(user);
      jwtService.signAsync
        .mockResolvedValueOnce('new_access_token')
        .mockResolvedValueOnce('new_refresh_token');

      const result = await service.refreshTokens(refreshDto);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        'valid_refresh_token',
        { secret: 'test_refresh_secret' },
      );
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
      });
      expect(result).toEqual({
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
      });
    });

    it('should throw UnauthorizedException when user not found in database', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'missing-id',
        username: 'ghost',
        role: Role.ADMIN,
      });
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.refreshTokens(refreshDto)).rejects.toThrow(
        new UnauthorizedException('Пользователь не найден'),
      );
    });

    it('should throw UnauthorizedException when refresh token verification fails', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('Token expired'));

      await expect(service.refreshTokens(refreshDto)).rejects.toThrow(
        new UnauthorizedException(
          'Недействительный или истекший refresh токен',
        ),
      );
    });

    it('should throw during instantiation if JWT_SECRET is missing', () => {
      const emptyConfigService = {
        get: jest.fn(),
        getOrThrow: jest.fn((key: string) => {
          throw new Error(`Missing config value for key: ${key}`);
        }),
      };

      expect(
        () =>
          new AuthService(
            prisma as unknown as PrismaService,
            jwtService as unknown as JwtService,
            emptyConfigService as unknown as ConfigService,
          ),
      ).toThrow('Missing config value for key: JWT_SECRET');
    });
  });

  describe('getProfile', () => {
    it('should return user profile when user exists', async () => {
      const profile = {
        id: 'user-uuid-1',
        username: 'testuser',
        role: Role.LEAD_ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.user.findUnique.mockResolvedValue(profile);

      const result = await service.getProfile('user-uuid-1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
        select: {
          id: true,
          username: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(profile);
    });

    it('should throw BadRequestException when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('non-existent-id')).rejects.toThrow(
        new BadRequestException('Пользователь не найден'),
      );
    });
  });
});
