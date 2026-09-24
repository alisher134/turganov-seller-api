import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CommunicationsService } from './communications.service';
import { WbClientService } from '../wb-client/wb-client.service';

describe('CommunicationsService', () => {
  let service: CommunicationsService;
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
        CommunicationsService,
        { provide: WbClientService, useValue: wbClient },
      ],
    }).compile();

    service = module.get<CommunicationsService>(CommunicationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFeedbacks', () => {
    it('should query single store when storeId is provided', async () => {
      wbClient.request.mockResolvedValueOnce({ data: { feedbacks: [] } });
      await service.getFeedbacks({ storeId: 'store-1' });
      expect(wbClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          storeId: 'store-1',
          service: 'feedbacks',
          path: '/api/v1/feedbacks',
        }),
      );
    });

    it('should aggregate across all stores when storeId is missing', async () => {
      wbClient.executeForAllStores.mockResolvedValueOnce([]);
      await service.getFeedbacks({});
      expect(wbClient.executeForAllStores).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'feedbacks',
          path: '/api/v1/feedbacks',
        }),
      );
    });
  });

  describe('answerFeedback', () => {
    it('should throw if storeId is missing', async () => {
      await expect(
        service.answerFeedback('', { id: 'fb-1', text: 'Спасибо!' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
