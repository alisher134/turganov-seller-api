import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { WbClientService } from '../wb-client/wb-client.service';

describe('OrdersService', () => {
  let service: OrdersService;
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
        OrdersService,
        { provide: WbClientService, useValue: wbClient },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getNewFbsOrders', () => {
    it('should query single store when storeId is given', async () => {
      wbClient.request.mockResolvedValueOnce({ orders: [] });
      await service.getNewFbsOrders('store-1');
      expect(wbClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          storeId: 'store-1',
          service: 'marketplace',
          path: '/api/v3/orders/new',
        }),
      );
    });

    it('should aggregate all stores when storeId is not provided', async () => {
      wbClient.executeForAllStores.mockResolvedValueOnce([]);
      await service.getNewFbsOrders();
      expect(wbClient.executeForAllStores).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'marketplace',
          path: '/api/v3/orders/new',
        }),
      );
    });
  });

  describe('cancelFbsOrder', () => {
    it('should throw if storeId is missing', async () => {
      await expect(service.cancelFbsOrder('', 12345)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
