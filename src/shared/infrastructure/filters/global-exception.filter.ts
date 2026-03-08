import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { GatewayException } from '../../../gateway/domain/exceptions/gateway.exceptions';

interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  code?: string;
  timestamp: string;
  path: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request.url);

    this.logger.error(
      `${request.method} ${request.url} - ${errorResponse.statusCode}: ${errorResponse.message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(exception: unknown, path: string): ErrorResponse {
    const timestamp = new Date().toISOString();

    if (exception instanceof GatewayException) {
      return {
        statusCode: exception.statusCode,
        message: exception.message,
        error: exception.name,
        code: exception.code,
        timestamp,
        path,
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      let message: string;
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message = Array.isArray(responseObj.message)
          ? responseObj.message.join(', ')
          : (responseObj.message as string) || exception.message;
      } else {
        message = exception.message;
      }

      return {
        statusCode: status,
        message,
        error: exception.name,
        timestamp,
        path,
      };
    }

    const errorMessage =
      exception instanceof Error ? exception.message : 'Error interno del servidor';

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: errorMessage,
      error: 'InternalServerError',
      timestamp,
      path,
    };
  }
}