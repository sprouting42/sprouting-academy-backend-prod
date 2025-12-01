import {
  ExceptionFilter,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import type { Request, Response } from 'express';

import { ErrorDebug } from '@/common/errors/error-info';
import { Response as GlobalResponse } from '@/common/response/response';
import { HTTP_HEADER } from '@/constants/http';
import { LogLevel } from '@/enums/log.enum';
import { NodeEnv } from '@/enums/node-env.enum';
import { EnvVariables } from '@/modules/config/dto/config.dto';
import { AppLoggerService } from '@/modules/logger/services/app-logger.service';
import { NanoUtil } from '@/utils/nano.util';

interface ExceptionFilterOptions {
  apiPaths?: string[];
  excludePaths?: string[];
  showDetailedErrorsForNonApi?: boolean;
  includeStackTrace?: boolean;
  enableFriendlyMessages?: boolean;
  correlationIdHeader?: string;
  logLevel?: LogLevel;
}

const DEFAULT_OPTIONS: ExceptionFilterOptions = {
  apiPaths: ['/api/v1/', '/api/'],
  excludePaths: ['/_health'],
  showDetailedErrorsForNonApi: false,
  includeStackTrace: process.env.NODE_ENV !== NodeEnv.PRODUCTION,
  enableFriendlyMessages: true,
  correlationIdHeader: HTTP_HEADER.CORRELATION_ID,
  logLevel: LogLevel.ERROR,
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly options: ExceptionFilterOptions;

  constructor(
    private readonly logger: AppLoggerService,
    options?: Partial<ExceptionFilterOptions>,
  ) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  private getFriendlyMessage(
    statusCode: HttpStatus,
    originalMessage: string,
  ): string {
    if (this.options.enableFriendlyMessages !== true) {
      return originalMessage || 'An error occurred';
    }

    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return 'The request contains invalid data. Please check your input and try again.';
      case HttpStatus.UNAUTHORIZED:
        return 'Authentication is required to access this resource.';
      case HttpStatus.FORBIDDEN:
        return 'You do not have permission to access this resource.';
      case HttpStatus.NOT_FOUND:
        return 'The requested resource could not be found.';
      case HttpStatus.CONFLICT:
        return 'The request conflicts with the current state of the resource.';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'The request data is valid but cannot be processed.';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'Too many requests. Please wait a moment before trying again.';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'An internal server error occurred. Please try again later.';
      case HttpStatus.BAD_GATEWAY:
        return 'The server received an invalid response from an upstream server.';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'The service is temporarily unavailable. Please try again later.';
      default:
        return originalMessage || 'An unexpected error occurred.';
    }
  }
  private shouldShowError(url: string): boolean {
    const normalizedUrl = url.toLowerCase();

    const isExcluded = Boolean(
      this.options.excludePaths?.some(path =>
        normalizedUrl.includes(path.toLowerCase()),
      ),
    );
    if (isExcluded) {
      return false;
    }

    const isApiPath = Boolean(
      this.options.apiPaths?.some(path =>
        normalizedUrl.startsWith(path.toLowerCase()),
      ),
    );

    return isApiPath || this.options.showDetailedErrorsForNonApi === true;
  }

  private shouldLogError(url: string, status: number): boolean {
    if (status >= 500) {
      return true;
    }

    return this.shouldShowError(url);
  }

  private extractErrorMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') {
        return response;
      }
      if (typeof response === 'object' && response !== null) {
        const responseObj = response as Record<string, unknown>;
        if (Array.isArray(responseObj.message)) {
          return responseObj.message.join(', ');
        }
        if (typeof responseObj.message === 'string') {
          return responseObj.message;
        }
      }
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return String(exception);
  }

  private getValidationErrors(exception: unknown): string[] | null {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && response !== null) {
        const responseObj = response as Record<string, unknown>;
        if (
          Array.isArray(responseObj.message) &&
          responseObj.message.every((item: unknown) => typeof item === 'string')
        ) {
          return responseObj.message;
        }
      }
    }
    return null;
  }

  private createCorrelationId(request: Request): string {
    const headerName =
      this.options.correlationIdHeader ?? HTTP_HEADER.CORRELATION_ID;
    const headerValue = request.get(headerName);
    const existingId =
      typeof headerValue === 'string' ? headerValue : undefined;
    return existingId ?? NanoUtil.generateId(10);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const correlationId = this.createCorrelationId(request);

    if (this.shouldLogError(request.url, status)) {
      const logMessage =
        exception instanceof Error
          ? (exception.stack ?? exception.message)
          : String(exception);
      this.logger.error(
        `${request.method} ${request.url} [${correlationId}]`,
        logMessage,
      );
    }

    if (!this.shouldShowError(request.url)) {
      const simpleResponse = {
        statusCode: status,
        message: this.getFriendlyMessage(status, ''),
        timestamp: new Date().toISOString(),
        ...(status >= 500 && { correlationId }),
      };
      response.status(status).json(simpleResponse);
      return;
    }

    const errorMessage = this.extractErrorMessage(exception);
    const validationErrors = this.getValidationErrors(exception);
    const friendlyMessage = this.getFriendlyMessage(status, errorMessage);

    const errorDetails: ErrorDebug = new ErrorDebug();
    errorDetails.message = errorMessage;
    errorDetails.code = String(status);

    if (validationErrors) {
      errorDetails.validationErrors = { errors: validationErrors };
    }

    if (
      EnvVariables.isDevelopment &&
      this.options.includeStackTrace === true &&
      exception instanceof Error &&
      exception.stack !== null &&
      exception.stack !== undefined &&
      exception.stack !== ''
    ) {
      errorDetails.debugInfo = exception.stack;
      errorDetails.debugSource = exception.name;
    }

    const errorResponse = GlobalResponse.create({
      correlationId,
      responseDate: new Date().toISOString(),
      statusCode: status,
      status: String(status),
      isSuccessful: false,
      errorMessage: friendlyMessage,
      errorDetails,
    });

    response.status(status).json(errorResponse);
  }
}
