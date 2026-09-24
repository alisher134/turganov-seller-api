import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { WbClientService } from '../wb-client/wb-client.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
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
        AnalyticsService,
        { provide: WbClientService, useValue: wbClient },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSalesFunnel', () => {
    it('should query single store when storeId is provided', async () => {
      wbClient.request.mockResolvedValueOnce({ data: [] });
      await service.getSalesFunnel({
        storeId: 'store-1',
        period: { begin: '2026-01-01', end: '2026-01-10' },
      });
      expect(wbClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          storeId: 'store-1',
          service: 'analytics',
          path: '/api/analytics/v3/sales-funnel/products',
        }),
      );
    });

    it('should aggregate across all stores when storeId is missing', async () => {
      wbClient.executeForAllStores.mockResolvedValueOnce([]);
      await service.getSalesFunnel({
        period: { begin: '2026-01-01', end: '2026-01-10' },
      });
      expect(wbClient.executeForAllStores).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'analytics',
          path: '/api/analytics/v3/sales-funnel/products',
        }),
      );
    });
  });

  describe('getSearchReport', () => {
    it('should throw if storeId is missing', async () => {
      await expect(service.getSearchReport('', {})).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
