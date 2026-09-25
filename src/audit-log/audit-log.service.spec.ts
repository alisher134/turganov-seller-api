import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from './audit-log.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let createMock: jest.Mock;
  let findManyMock: jest.Mock;
  let countMock: jest.Mock;

  beforeEach(async () => {
    createMock = jest.fn();
    findManyMock = jest.fn();
    countMock = jest.fn();

    const mockPrisma = {
      auditLog: {
        create: createMock,
        findMany: findManyMock,
        count: countMock,
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('should create an audit log entry', async () => {
      createMock.mockResolvedValue({ id: 'log-1' });

      await service.log({
        action: 'UPDATE_PRICE',
        module: 'items',
        userId: 'user-1',
        storeId: 'store-1',
      });

      expect(createMock).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          storeId: 'store-1',
          action: 'UPDATE_PRICE',
          module: 'items',
          details: undefined,
          ipAddress: null,
        },
      });
    });

    it('should catch and swallow errors without throwing', async () => {
      createMock.mockRejectedValue(new Error('DB failure'));

      await expect(
        service.log({
          action: 'UPDATE_PRICE',
          module: 'items',
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('findMany', () => {
    it('should return data and total count', async () => {
      const mockLogs = [{ id: '1', action: 'LOGIN', module: 'auth' }];
      findManyMock.mockResolvedValue(mockLogs);
      countMock.mockResolvedValue(1);

      const result = await service.findMany({
        action: 'LOGIN',
        limit: 10,
        offset: 0,
      });

      expect(result).toEqual({ data: mockLogs, total: 1 });
      expect(findManyMock).toHaveBeenCalled();
      expect(countMock).toHaveBeenCalled();
    });
  });
});
