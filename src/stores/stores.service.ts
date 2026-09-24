import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WbTokenCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { encryptToken, maskToken } from '../common/utils/crypto.util';
import { WbClientService } from '../wb-client/wb-client.service';
import { CreateStoreDto, UpdateStoreDto, CreateTokenDto } from './dto';

@Injectable()
export class StoresService {
  private readonly logger = new Logger(StoresService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly wbClient: WbClientService,
  ) {}

  private get secret(): string {
    return (
      this.configService.get<string>('JWT_SECRET') ||
      'default-turganov-seller-secret-key-32b'
    );
  }

  async createStore(dto: CreateStoreDto) {
    const name = dto.name.trim();

    const existing = await this.prisma.store.findUnique({
      where: { name },
    });
    if (existing) {
      throw new ConflictException(
        `Магазин с названием "${name}" уже существует`,
      );
    }

    const store = await this.prisma.store.create({
      data: {
        name,
        inn: dto.inn?.trim() || null,
        description: dto.description?.trim() || null,
      },
    });

    if (dto.token && dto.token.trim()) {
      const encrypted = encryptToken(dto.token.trim(), this.secret);
      await this.prisma.wbApiToken.create({
        data: {
          storeId: store.id,
          token: encrypted,
          tokenName: dto.tokenName?.trim() || 'Основной токен',
          category: WbTokenCategory.STANDARD,
        },
      });
    }

    return this.findStoreById(store.id);
  }

  async findAllStores() {
    const stores = await this.prisma.store.findMany({
      include: {
        tokens: {
          select: {
            id: true,
            tokenName: true,
            category: true,
            isActive: true,
            token: true,
            expiresAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return stores.map((store) => ({
      ...store,
      hasActiveToken: store.tokens.some((t) => t.isActive),
      tokensCount: store.tokens.length,
      tokens: store.tokens.map((token) => ({
        ...token,
        maskedToken: maskToken(token.token),
        token: undefined, // Hide encrypted/raw string from general response
      })),
    }));
  }

  async findStoreById(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        tokens: {
          select: {
            id: true,
            tokenName: true,
            category: true,
            isActive: true,
            token: true,
            expiresAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!store) {
      throw new NotFoundException(`Магазин с ID "${id}" не найден`);
    }

    return {
      ...store,
      hasActiveToken: store.tokens.some((t) => t.isActive),
      tokensCount: store.tokens.length,
      tokens: store.tokens.map((token) => ({
        ...token,
        maskedToken: maskToken(token.token),
        token: undefined,
      })),
    };
  }

  async updateStore(id: string, dto: UpdateStoreDto) {
    await this.ensureStoreExists(id);

    if (dto.name) {
      const name = dto.name.trim();
      const duplicate = await this.prisma.store.findFirst({
        where: {
          name,
          NOT: { id },
        },
      });
      if (duplicate) {
        throw new ConflictException(
          `Магазин с названием "${name}" уже существует`,
        );
      }
    }

    await this.prisma.store.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name.trim() }),
        ...(dto.inn !== undefined && { inn: dto.inn ? dto.inn.trim() : null }),
        ...(dto.description !== undefined && {
          description: dto.description ? dto.description.trim() : null,
        }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });

    return this.findStoreById(id);
  }

  async deleteStore(id: string) {
    await this.ensureStoreExists(id);
    await this.prisma.store.delete({ where: { id } });
    return { message: 'Магазин успешно удален' };
  }

  async addOrUpdateToken(storeId: string, dto: CreateTokenDto) {
    await this.ensureStoreExists(storeId);

    const category = dto.category || WbTokenCategory.STANDARD;
    const encrypted = encryptToken(dto.token.trim(), this.secret);
    const tokenName =
      dto.tokenName?.trim() ||
      (category === WbTokenCategory.STANDARD
        ? 'Основной токен'
        : `Токен ${category}`);

    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;

    const tokenRecord = await this.prisma.wbApiToken.upsert({
      where: {
        storeId_category: {
          storeId,
          category,
        },
      },
      update: {
        token: encrypted,
        tokenName,
        isActive: true,
        expiresAt,
      },
      create: {
        storeId,
        token: encrypted,
        tokenName,
        category,
        isActive: true,
        expiresAt,
      },
    });

    return {
      id: tokenRecord.id,
      storeId: tokenRecord.storeId,
      tokenName: tokenRecord.tokenName,
      category: tokenRecord.category,
      isActive: tokenRecord.isActive,
      maskedToken: maskToken(dto.token),
      expiresAt: tokenRecord.expiresAt,
      createdAt: tokenRecord.createdAt,
      updatedAt: tokenRecord.updatedAt,
    };
  }

  async removeToken(storeId: string, tokenId: string) {
    await this.ensureStoreExists(storeId);

    const token = await this.prisma.wbApiToken.findFirst({
      where: { id: tokenId, storeId },
    });

    if (!token) {
      throw new NotFoundException('Токен не найден у данного магазина');
    }

    await this.prisma.wbApiToken.delete({ where: { id: tokenId } });
    return { message: 'Токен успешно удален' };
  }

  async pingStore(storeId: string) {
    return this.wbClient.pingStore(storeId);
  }

  async pingAllStores() {
    return this.wbClient.pingAllStores();
  }

  private async ensureStoreExists(id: string) {
    const store = await this.prisma.store.findUnique({ where: { id } });
    if (!store) {
      throw new NotFoundException(`Магазин с ID "${id}" не найден`);
    }
    return store;
  }
}
