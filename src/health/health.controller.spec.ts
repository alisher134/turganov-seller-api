import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;
  let prisma: PrismaService;

  beforeEach(() => {
    prisma = {
      $queryRaw: jest.fn(),
    } as unknown as PrismaService;

    controller = new HealthController(prisma);
  });

  it('should return health status when database is reachable', async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ '?column?': 1 }]);

    const result = await controller.check();

    expect(result.status).toBe('ok');
    expect(result.database.status).toBe('up');
    expect(result.uptime).toBeGreaterThanOrEqual(0);
  });

  it('should throw ServiceUnavailableException when database is down', async () => {
    (prisma.$queryRaw as jest.Mock).mockRejectedValue(
      new Error('Connection timeout'),
    );

    await expect(controller.check()).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
