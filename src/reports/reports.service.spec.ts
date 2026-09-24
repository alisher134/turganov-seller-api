import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { WbClientService } from '../wb-client/wb-client.service';

describe('ReportsService', () => {
  let service: ReportsService;
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
        ReportsService,
        { provide: WbClientService, useValue: wbClient },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOrdersReport', () => {
    it('should query single store when storeId is provided', async () => {
      wbClient.request.mockResolvedValueOnce([]);
      await service.getOrdersReport('store-1', '2026-01-01');
      expect(wbClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          storeId: 'store-1',
          service: 'statistics',
          path: '/api/v1/supplier/orders',
        }),
      );
    });

    it('should aggregate across all stores when storeId is not provided', async () => {
      wbClient.executeForAllStores.mockResolvedValueOnce([]);
      await service.getOrdersReport();
      expect(wbClient.executeForAllStores).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'statistics',
          path: '/api/v1/supplier/orders',
        }),
      );
    });
  });
});
