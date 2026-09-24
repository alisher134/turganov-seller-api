import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { FinancesService } from './finances.service';
import { WbClientService } from '../wb-client/wb-client.service';

describe('FinancesService', () => {
  let service: FinancesService;
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
        FinancesService,
        { provide: WbClientService, useValue: wbClient },
      ],
    }).compile();

    service = module.get<FinancesService>(FinancesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBalance', () => {
    it('should query single store when storeId is provided', async () => {
      wbClient.request.mockResolvedValueOnce({ balance: 50000 });
      await service.getBalance('store-1');
      expect(wbClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          storeId: 'store-1',
          service: 'finance',
          path: '/api/v1/account/balance',
        }),
      );
    });

    it('should aggregate across all stores when storeId is not provided', async () => {
      wbClient.executeForAllStores.mockResolvedValueOnce([]);
      await service.getBalance();
      expect(wbClient.executeForAllStores).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'finance',
          path: '/api/v1/account/balance',
        }),
      );
    });
  });

  describe('getDetailedSalesReport', () => {
    it('should throw if storeId is missing', async () => {
      await expect(service.getDetailedSalesReport('', 123)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
