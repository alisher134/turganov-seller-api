import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ItemsService } from './items.service';
import { WbClientService } from '../wb-client/wb-client.service';

import {
  CardsService,
  PricesService,
  WarehousesService,
  ContentDirectoriesService,
} from './services';

describe('ItemsService', () => {
  let service: ItemsService;
  let wbClient: {
    request: jest.Mock;
    executeForAllStores: jest.Mock;
    requestOrAll: jest.Mock;
  };

  beforeEach(async () => {
    wbClient = {
      request: jest.fn(),
      executeForAllStores: jest.fn(),
      requestOrAll: jest
        .fn()
        .mockImplementation((opt: { storeId?: string | null }) => {
          if (opt.storeId && opt.storeId !== 'all') {
            return wbClient.request(opt) as Promise<unknown>;
          }
          const optionsWithoutStore = { ...opt };
          delete optionsWithoutStore.storeId;
          return wbClient.executeForAllStores(
            optionsWithoutStore,
          ) as Promise<unknown>;
        }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        PricesService,
        WarehousesService,
        ContentDirectoriesService,
        ItemsService,
        { provide: WbClientService, useValue: wbClient },
      ],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCards', () => {
    it('should query single store when storeId is provided', async () => {
      wbClient.request.mockResolvedValueOnce({ cards: [] });
      const res = (await service.getCards({ storeId: 'store-1' })) as {
        cards: unknown[];
      };
      expect(wbClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          storeId: 'store-1',
          service: 'content',
          path: '/content/v2/get/cards/list',
        }),
      );
      expect(res).toEqual({ cards: [] });
    });

    it('should aggregate across all stores when storeId is missing', async () => {
      wbClient.executeForAllStores.mockResolvedValueOnce([]);
      await service.getCards({});
      expect(wbClient.executeForAllStores).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'content',
          path: '/content/v2/get/cards/list',
        }),
      );
    });
  });

  describe('getPrices', () => {
    it('should fetch prices for store', async () => {
      wbClient.request.mockResolvedValueOnce({ data: { listGoods: [] } });
      await service.getPrices('store-1', 50, 0);
      expect(wbClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          storeId: 'store-1',
          service: 'prices',
          path: '/api/v2/list/goods/filter',
        }),
      );
    });
  });

  describe('createCard', () => {
    it('should throw BadRequestException if storeId is missing', async () => {
      await expect(service.createCard('', [])).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
