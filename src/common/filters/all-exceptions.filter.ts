import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface ErrorResponseBody {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error: string | undefined = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const respObj = exceptionResponse as Record<string, unknown>;
        message = (respObj.message as string | string[]) || exception.message;
        error = (respObj.error as string) || exception.name;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const stack = exception instanceof Error ? exception.stack : undefined;
      const messageStr = Array.isArray(message)
        ? message.join(', ')
        : String(message);
      this.logger.error(
        `[${request?.method ?? 'UNKNOWN'}] ${request?.url ?? 'UNKNOWN'} - Status: ${status} - Error: ${messageStr}`,
        stack,
      );
    }

    const responseBody: ErrorResponseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request?.url ?? '',
      method: request?.method ?? '',
      message,
      ...(error && { error }),
    };

    response.status(status).json(responseBody);
  }
}
