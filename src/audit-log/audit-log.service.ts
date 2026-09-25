import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateAuditLogInput {
  userId?: string;
  storeId?: string;
  action: string;
  module: string;
  details?: Prisma.InputJsonValue;
  ipAddress?: string;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates an audit log entry. This method is fire-and-forget —
   * audit logging should never break the main business flow.
   */
  async log(input: CreateAuditLogInput): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: input.userId || null,
          storeId: input.storeId || null,
          action: input.action,
          module: input.module,
          details: input.details || undefined,
          ipAddress: input.ipAddress || null,
        },
      });
    } catch (error) {
      // Audit logging must never throw — log and swallow
      this.logger.error(
        `Failed to write audit log: ${input.action} in ${input.module}`,
        error,
      );
    }
  }

  async findMany(filters?: {
    userId?: string;
    storeId?: string;
    action?: string;
    module?: string;
    from?: Date;
    to?: Date;
    limit?: number;
    offset?: number;
  }) {
    const where: Record<string, unknown> = {};

    if (filters?.userId) where.userId = filters.userId;
    if (filters?.storeId) where.storeId = filters.storeId;
    if (filters?.action) where.action = filters.action;
    if (filters?.module) where.module = filters.module;

    if (filters?.from || filters?.to) {
      where.createdAt = {
        ...(filters.from && { gte: filters.from }),
        ...(filters.to && { lte: filters.to }),
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, username: true, role: true },
          },
          store: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, total };
  }
}
