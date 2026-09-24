import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { WbClientService } from '../wb-client/wb-client.service';

describe('PromotionService', () => {
  let service: PromotionService;
  let wbClient: {
    request: jest.Mock;
    executeForAllStores: jest.Mock;
  };

  beforeEach(async () => {
    wbClient = {
      request: jest.fn(),
      executeForAllStores: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromotionService,
        { provide: WbClientService, useValue: wbClient },
      ],
    }).compile();

    service = module.get<PromotionService>(PromotionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPromotionCount', () => {
    it('should query single store when storeId is provided', async () => {
      wbClient.request.mockResolvedValueOnce({ adverts: [] });
      await service.getPromotionCount('store-1');
      expect(wbClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          storeId: 'store-1',
          service: 'promotion',
          path: '/adv/v1/promotion/count',
        }),
      );
    });

    it('should aggregate across all stores when storeId is missing', async () => {
      wbClient.executeForAllStores.mockResolvedValueOnce([]);
      await service.getPromotionCount();
      expect(wbClient.executeForAllStores).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'promotion',
          path: '/adv/v1/promotion/count',
        }),
      );
    });
  });

  describe('startCampaign', () => {
    it('should throw if storeId is missing', async () => {
      await expect(service.startCampaign('', 123)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
