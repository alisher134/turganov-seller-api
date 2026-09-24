import { Test, TestingModule } from '@nestjs/testing';
import { GeneralService } from './general.service';
import { WbClientService } from '../wb-client/wb-client.service';

describe('GeneralService', () => {
  let service: GeneralService;
  let wbClient: {
    pingStore: jest.Mock;
    pingAllStores: jest.Mock;
    request: jest.Mock;
    executeForAllStores: jest.Mock;
  };

  beforeEach(async () => {
    wbClient = {
      pingStore: jest.fn(),
      pingAllStores: jest.fn(),
      request: jest.fn(),
      executeForAllStores: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeneralService,
        { provide: WbClientService, useValue: wbClient },
      ],
    }).compile();

    service = module.get<GeneralService>(GeneralService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('ping', () => {
    it('should ping specific store if storeId provided', async () => {
      wbClient.pingStore.mockResolvedValueOnce({ success: true });
      await service.ping('store-123');
      expect(wbClient.pingStore).toHaveBeenCalledWith('store-123');
    });

    it('should ping all stores if storeId not provided', async () => {
      wbClient.pingAllStores.mockResolvedValueOnce([]);
      await service.ping();
      expect(wbClient.pingAllStores).toHaveBeenCalled();
    });
  });

  describe('getSellerInfo', () => {
    it('should request seller-info for single store', async () => {
      wbClient.request.mockResolvedValueOnce({ name: 'ИП Иванов' });
      const res = (await service.getSellerInfo('store-1')) as { name: string };
      expect(wbClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          storeId: 'store-1',
          service: 'common',
          path: '/api/v1/seller-info',
        }),
      );
      expect(res).toEqual({ name: 'ИП Иванов' });
    });

    it('should call executeForAllStores if storeId is missing', async () => {
      wbClient.executeForAllStores.mockResolvedValueOnce([]);
      await service.getSellerInfo();
      expect(wbClient.executeForAllStores).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'common',
          path: '/api/v1/seller-info',
        }),
      );
    });
  });
});
