import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ConflictException } from '@nestjs/common';
import { WbTokenCategory } from '@prisma/client';
import { StoresService } from './stores.service';
import { PrismaService } from '../prisma/prisma.service';
import { WbClientService } from '../wb-client/wb-client.service';

describe('StoresService', () => {
  let service: StoresService;
  let prisma: {
    store: {
      create: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    wbApiToken: {
      create: jest.Mock;
      upsert: jest.Mock;
      findFirst: jest.Mock;
      delete: jest.Mock;
    };
  };
  let wbClient: {
    pingStore: jest.Mock;
    pingAllStores: jest.Mock;
  };

  const mockConfig = {
    get: jest.fn().mockReturnValue('test-secret-key-32b-length-secure!'),
  };

  beforeEach(async () => {
    prisma = {
      store: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      wbApiToken: {
        create: jest.fn(),
        upsert: jest.fn(),
        findFirst: jest.fn(),
        delete: jest.fn(),
      },
    };

    wbClient = {
      pingStore: jest.fn(),
      pingAllStores: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoresService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: mockConfig },
        { provide: WbClientService, useValue: wbClient },
      ],
    }).compile();

    service = module.get<StoresService>(StoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createStore', () => {
    it('should create store successfully without token', async () => {
      prisma.store.findUnique.mockResolvedValueOnce(null);
      prisma.store.create.mockResolvedValueOnce({
        id: 'store-1',
        name: 'ИП Иванов',
        inn: '123456789012',
        description: null,
      });
      prisma.store.findUnique.mockResolvedValueOnce({
        id: 'store-1',
        name: 'ИП Иванов',
        inn: '123456789012',
        description: null,
        tokens: [],
      });

      const result = await service.createStore({
        name: 'ИП Иванов',
        inn: '123456789012',
      });

      expect(result.name).toEqual('ИП Иванов');
      expect(result.hasActiveToken).toBe(false);
      expect(prisma.store.create).toHaveBeenCalledWith({
        data: {
          name: 'ИП Иванов',
          inn: '123456789012',
          description: null,
        },
      });
    });

    it('should throw ConflictException if store name already exists', async () => {
      prisma.store.findUnique.mockResolvedValueOnce({ id: 'store-1' });

      await expect(
        service.createStore({ name: 'Существующий магазин' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAllStores', () => {
    it('should return stores with masked tokens and not raw strings', async () => {
      prisma.store.findMany.mockResolvedValueOnce([
        {
          id: 'store-1',
          name: 'Магазин 1',
          tokens: [
            {
              id: 'tok-1',
              tokenName: 'Основной',
              category: WbTokenCategory.STANDARD,
              isActive: true,
              token: 'test-plain-token-here-123456',
            },
          ],
        },
      ]);

      const stores = await service.findAllStores();
      expect(stores).toHaveLength(1);
      expect(stores[0].hasActiveToken).toBe(true);
      expect(stores[0].tokens[0].token).toBeUndefined();
      expect(stores[0].tokens[0].maskedToken).toBeDefined();
    });
  });

  describe('pingStore', () => {
    it('should call wbClient.pingStore', async () => {
      wbClient.pingStore.mockResolvedValueOnce({
        storeId: 'store-1',
        success: true,
        latencyMs: 120,
        message: 'OK',
      });

      const res = await service.pingStore('store-1');
      expect(res.success).toBe(true);
      expect(wbClient.pingStore).toHaveBeenCalledWith('store-1');
    });
  });
});
