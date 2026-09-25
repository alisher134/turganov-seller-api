import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WbTokenCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { decryptToken, isAllStores, runWithConcurrency } from '../common/utils';
import { WB_BASE_URLS } from './wb-client.constants';
import {
  WbRequestOptions,
  WbMultiStoreResult,
  WbRequestOrAllOptions,
} from './wb-client.interface';

interface ErrorWithResponse {
  response?: {
    message?: string;
    statusCode?: number;
  };
  status?: number;
  message?: string;
  name?: string;
  stack?: string;
}

/** Max consecutive 401 failures before auto-deactivating a token */
const MAX_CONSECUTIVE_FAILURES = 3;

@Injectable()
export class WbClientService {
  private readonly logger = new Logger(WbClientService.name);
  private readonly defaultTimeoutMs = 30000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Returns the encryption secret used for WB API tokens.
   * Prioritizes TOKEN_ENCRYPTION_KEY, falls back to JWT_SECRET.
   */
  private get encryptionSecret(): string {
    const secret =
      this.configService.get<string>('TOKEN_ENCRYPTION_KEY') ||
      this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error(
        'Neither TOKEN_ENCRYPTION_KEY nor JWT_SECRET is configured. Cannot decrypt store tokens.',
      );
    }
    return secret;
  }

  /**
   * Retrieves and decrypts the active WB API token for a store.
   * Priority: exact category match -> STANDARD -> any active token.
   *
   * Validates:
   * - Store exists and is active
   * - Token is not expired (expiresAt)
   * - Token has not exceeded consecutive failure threshold
   */
  async resolveToken(
    storeId: string,
    category?: WbTokenCategory,
  ): Promise<string> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: {
        tokens: {
          where: { isActive: true },
        },
      },
    });

    if (!store) {
      throw new NotFoundException(`Магазин с ID "${storeId}" не найден`);
    }

    if (!store.isActive) {
      throw new BadRequestException(
        `Магазин "${store.name}" деактивирован. Включите его в настройках.`,
      );
    }

    // Filter out expired tokens
    const now = new Date();
    const validTokens = store.tokens.filter(
      (t) => !t.expiresAt || t.expiresAt > now,
    );

    if (!validTokens || validTokens.length === 0) {
      const expiredCount = store.tokens.length - validTokens.length;
      const suffix =
        expiredCount > 0 ? ` (${expiredCount} токен(ов) истекли)` : '';
      throw new BadRequestException(
        `У магазина "${store.name}" нет действующих API токенов Wildberries${suffix}`,
      );
    }

    let matchedToken = category
      ? validTokens.find((t) => t.category === category)
      : undefined;

    if (!matchedToken) {
      matchedToken = validTokens.find(
        (t) => t.category === WbTokenCategory.STANDARD,
      );
    }

    if (!matchedToken) {
      matchedToken = validTokens[0];
    }

    // Update lastUsedAt
    await this.prisma.wbApiToken.update({
      where: { id: matchedToken.id },
      data: { lastUsedAt: now },
    });

    const decrypted = decryptToken(matchedToken.token, this.encryptionSecret);

    return decrypted.trim();
  }

  /**
   * Records a successful WB API call — resets consecutive failure counter.
   */
  private async recordTokenSuccess(
    storeId: string,
    category?: WbTokenCategory,
  ): Promise<void> {
    try {
      const token = await this.prisma.wbApiToken.findFirst({
        where: {
          storeId,
          isActive: true,
          category: category || WbTokenCategory.STANDARD,
        },
      });
      if (token && token.consecutiveFailures > 0) {
        await this.prisma.wbApiToken.update({
          where: { id: token.id },
          data: { consecutiveFailures: 0 },
        });
      }
    } catch {
      // Non-critical — don't let tracking errors break the main flow
    }
  }

  /**
   * Records a 401 failure. Auto-deactivates the token after MAX_CONSECUTIVE_FAILURES.
   */
  private async recordTokenFailure(
    storeId: string,
    category?: WbTokenCategory,
  ): Promise<void> {
    try {
      const token = await this.prisma.wbApiToken.findFirst({
        where: {
          storeId,
          isActive: true,
          category: category || WbTokenCategory.STANDARD,
        },
      });
      if (!token) return;

      const newCount = token.consecutiveFailures + 1;
      const shouldDeactivate = newCount >= MAX_CONSECUTIVE_FAILURES;

      await this.prisma.wbApiToken.update({
        where: { id: token.id },
        data: {
          consecutiveFailures: newCount,
          ...(shouldDeactivate && { isActive: false }),
        },
      });

      if (shouldDeactivate) {
        this.logger.warn(
          `[Token Auto-Deactivated] Store "${storeId}", category "${category || 'STANDARD'}" — ` +
            `${MAX_CONSECUTIVE_FAILURES} consecutive 401 failures. Token deactivated.`,
        );
      }
    } catch {
      // Non-critical
    }
  }

  /**
   * Sends an HTTP request to Wildberries API for a specific store.
   */
  async request<T>(options: WbRequestOptions): Promise<T> {
    const {
      storeId,
      service,
      path,
      method = 'GET',
      category,
      query,
      body,
      headers: customHeaders = {},
      timeoutMs = this.defaultTimeoutMs,
    } = options;

    const token = await this.resolveToken(storeId, category);
    const baseUrl = WB_BASE_URLS[service];
    if (!baseUrl) {
      throw new BadRequestException(`Неизвестный сервис WB API: ${service}`);
    }

    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${baseUrl}${cleanPath}`);

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const reqHeaders: Record<string, string> = {
      Authorization: token,
      Accept: 'application/json',
      ...customHeaders,
    };

    let reqBody: string | undefined;
    if (body !== undefined && body !== null && method !== 'GET') {
      reqHeaders['Content-Type'] = 'application/json';
      reqBody = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const startTime = Date.now();
    try {
      const response = await fetch(url.toString(), {
        method,
        headers: reqHeaders,
        body: reqBody,
        signal: AbortSignal.timeout(timeoutMs),
      });

      const latency = Date.now() - startTime;
      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');

      const responseText = await response.text();
      let responseData: unknown = responseText;

      if (responseText && isJson) {
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = responseText;
        }
      }

      if (!response.ok) {
        // Track 401 failures for auto-deactivation
        if (response.status === 401) {
          await this.recordTokenFailure(storeId, category);
        }

        const parsedRecord =
          typeof responseData === 'object' && responseData !== null
            ? (responseData as Record<string, unknown>)
            : null;

        const errorMsg: string =
          (typeof parsedRecord?.message === 'string'
            ? parsedRecord.message
            : null) ||
          (typeof parsedRecord?.errorText === 'string'
            ? parsedRecord.errorText
            : null) ||
          (typeof parsedRecord?.detail === 'string'
            ? parsedRecord.detail
            : null) ||
          (typeof responseData === 'string' ? responseData : null) ||
          response.statusText ||
          `WB API error with status ${response.status}`;

        this.logger.warn(
          `[WB API Error] ${method} ${url.pathname} (${response.status}) [${latency}ms]: ${errorMsg}`,
        );

        throw new HttpException(
          {
            statusCode: response.status,
            error: 'Wildberries API Error',
            message: errorMsg,
            service,
            path: cleanPath,
            wbDetails: responseData,
          },
          response.status >= 500
            ? HttpStatus.BAD_GATEWAY
            : response.status === 401
              ? HttpStatus.UNAUTHORIZED
              : HttpStatus.BAD_REQUEST,
        );
      }

      // Successful request — reset consecutive failure counter
      await this.recordTokenSuccess(storeId, category);

      return responseData as T;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      const err = error as ErrorWithResponse;
      if (err?.name === 'TimeoutError') {
        throw new HttpException(
          `Запрос к WB API (${service}${cleanPath}) превысил таймаут ${timeoutMs}мс`,
          HttpStatus.GATEWAY_TIMEOUT,
        );
      }

      this.logger.error(
        `[WB API Network Error] ${method} ${url.toString()}: ${err?.message || 'Unknown network error'}`,
        err?.stack,
      );

      throw new HttpException(
        `Сетевая ошибка при обращении к Wildberries (${service}): ${err?.message || 'Неизвестная ошибка'}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * Helper that executes a request for a single store if a specific storeId is provided,
   * or across all active stores if storeId is missing, empty, or 'all'.
   */
  async requestOrAll<T = unknown>(
    options: WbRequestOrAllOptions,
  ): Promise<T | WbMultiStoreResult<T>[]> {
    if (!isAllStores(options.storeId)) {
      return this.request<T>({
        ...options,
        storeId: options.storeId as string,
      });
    }

    const optionsWithoutStore = { ...options };
    delete optionsWithoutStore.storeId;
    return this.executeForAllStores<T>(optionsWithoutStore);
  }

  /**
   * Executes a WB API request across all active stores with controlled parallelism.
   */
  async executeForAllStores<T>(
    options: Omit<WbRequestOptions, 'storeId'>,
    concurrency = 5,
  ): Promise<WbMultiStoreResult<T>[]> {
    const activeStores = await this.prisma.store.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    const results = await runWithConcurrency(
      activeStores,
      concurrency,
      async (store) => {
        try {
          const data = await this.request<T>({
            ...options,
            storeId: store.id,
          });
          return {
            storeId: store.id,
            storeName: store.name,
            success: true,
            data,
          };
        } catch (error: unknown) {
          const err = error as ErrorWithResponse;
          const errorMsg =
            err?.response?.message || err?.message || 'Ошибка запроса';
          const statusCode = err?.status || err?.response?.statusCode || 500;
          return {
            storeId: store.id,
            storeName: store.name,
            success: false,
            error: errorMsg,
            statusCode,
          };
        }
      },
    );

    return results.map((res, index) => {
      if (res.status === 'fulfilled') {
        return res.value;
      }
      const reasonErr = res.reason as ErrorWithResponse;
      return {
        storeId: activeStores[index].id,
        storeName: activeStores[index].name,
        success: false,
        error: reasonErr?.message || 'Неизвестный сбой запроса',
        statusCode: 500,
      };
    });
  }

  /**
   * Checks connectivity and token validity for a specific store using WB /ping.
   */
  async pingStore(storeId: string): Promise<{
    storeId: string;
    success: boolean;
    latencyMs: number;
    message: string;
  }> {
    const startTime = Date.now();
    try {
      await this.request({
        storeId,
        service: 'common',
        path: '/ping',
        method: 'GET',
        timeoutMs: 8000,
      });
      return {
        storeId,
        success: true,
        latencyMs: Date.now() - startTime,
        message: 'Подключение к WB API успешно установлено',
      };
    } catch (error: unknown) {
      const err = error as ErrorWithResponse;
      return {
        storeId,
        success: false,
        latencyMs: Date.now() - startTime,
        message:
          err?.response?.message ||
          err?.message ||
          'Не удалось подключиться к WB API',
      };
    }
  }

  async pingAllStores(): Promise<
    Array<{
      storeId: string;
      storeName: string;
      success: boolean;
      latencyMs: number;
      message: string;
    }>
  > {
    const activeStores = await this.prisma.store.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    const pingResults = await Promise.all(
      activeStores.map(async (store) => {
        const ping = await this.pingStore(store.id);
        return {
          storeId: store.id,
          storeName: store.name,
          success: ping.success,
          latencyMs: ping.latencyMs,
          message: ping.message,
        };
      }),
    );

    return pingResults;
  }
}
