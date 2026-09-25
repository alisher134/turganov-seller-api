import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../prisma/prisma.service';

export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  database: {
    status: string;
    latencyMs: number;
    error?: string;
  };
  memory: {
    heapUsedMb: number;
    rssMb: number;
  };
}

@ApiTags('Health')
@Controller('health')
@SkipThrottle()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'Liveness and database readiness probe' })
  @ApiResponse({ status: 200, description: 'Application and DB are healthy' })
  @ApiResponse({ status: 503, description: 'Database unavailable' })
  @Get()
  async check(): Promise<HealthResponse> {
    const startTime = Date.now();
    let dbStatus = 'up';
    let dbError: string | undefined;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (err: unknown) {
      dbStatus = 'down';
      dbError = err instanceof Error ? err.message : 'Unknown database error';
    }

    const latencyMs = Date.now() - startTime;
    const isHealthy = dbStatus === 'up';

    const memoryUsage = process.memoryUsage();

    const responseBody = {
      status: isHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbStatus,
        latencyMs,
        ...(dbError && { error: dbError }),
      },
      memory: {
        heapUsedMb:
          Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
        rssMb: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
      },
    };

    if (!isHealthy) {
      throw new ServiceUnavailableException(responseBody);
    }

    return responseBody;
  }
}
