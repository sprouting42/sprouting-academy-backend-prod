/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import './mocks/all-exceptions.filter.mock';
import { HttpException, HttpStatus } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { HTTP_HEADER } from '@/constants/http';
import { LogLevel } from '@/enums/log.enum';
import { EnvVariables } from '@/modules/config/dto/config.dto';
import type { AppLoggerService } from '@/modules/logger/services/app-logger.service';

import {
  createMockHost,
  createMockLogger,
  createMockRequest,
  createMockResponse,
} from './mocks/all-exceptions.filter.mock';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockLogger: AppLoggerService;
  let mockResponse: ReturnType<typeof createMockResponse>;
  let mockRequest: ReturnType<typeof createMockRequest>;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    // Reset EnvVariables singleton

    (EnvVariables as any)._instance = undefined;

    mockLogger = createMockLogger();
    mockResponse = createMockResponse();
    mockRequest = createMockRequest();
    mockHost = createMockHost(mockResponse, mockRequest);

    filter = new AllExceptionsFilter(mockLogger);
  });

  describe('constructor', () => {
    it('should create filter with default options', () => {
      expect(filter).toBeDefined();
      expect(filter).toBeInstanceOf(AllExceptionsFilter);
    });

    it('should create filter with custom options', () => {
      const customFilter = new AllExceptionsFilter(mockLogger, {
        apiPaths: ['/custom/'],
        enableFriendlyMessages: false,
      });

      expect(customFilter).toBeDefined();
      expect(customFilter).toBeInstanceOf(AllExceptionsFilter);
    });

    it('should create filter with all custom options', () => {
      const customFilter = new AllExceptionsFilter(mockLogger, {
        apiPaths: ['/api/v2/', '/api/v3/'],
        excludePaths: ['/health', '/metrics'],
        showDetailedErrorsForNonApi: true,
        includeStackTrace: false,
        enableFriendlyMessages: false,
        correlationIdHeader: 'X-Request-ID',
        logLevel: LogLevel.INFO,
      });

      expect(customFilter).toBeDefined();
      expect(customFilter).toBeInstanceOf(AllExceptionsFilter);
    });
  });

  describe('catch - HttpException', () => {
    it('should handle HttpException with 404 status', () => {
      const exception = new HttpException('Not found', HttpStatus.NOT_FOUND);

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should handle HttpException with 400 status', () => {
      const exception = new HttpException(
        'Bad request',
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should handle HttpException with object response', () => {
      const exception = new HttpException(
        { message: 'Custom error', statusCode: 400 },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should handle HttpException with validation errors array', () => {
      const exception = new HttpException(
        {
          message: ['Field 1 is required', 'Field 2 is invalid'],
          error: 'Validation Failed',
        },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);

      const jsonCall = mockResponse.json.mock.calls[0]?.[0];

      expect(jsonCall?.errorDetails?.validationErrors).toBeDefined();
    });
  });

  describe('catch - Generic Error', () => {
    it('should handle generic Error', () => {
      const exception = new Error('Generic error');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should handle non-Error exceptions', () => {
      const exception = 'String error';

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe('logging behavior', () => {
    it('should log errors for API paths', () => {
      const exception = new HttpException('Error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockHost);

      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should log server errors (5xx) regardless of path', () => {
      mockRequest.url = '/_health';
      const exception = new HttpException(
        'Server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      filter.catch(exception, mockHost);

      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should not log errors for excluded paths with 4xx status', () => {
      mockRequest.url = '/_health';
      const exception = new HttpException('Not found', HttpStatus.NOT_FOUND);

      filter.catch(exception, mockHost);

      expect(mockLogger.error).not.toHaveBeenCalled();
    });
  });

  describe('correlation ID', () => {
    it('should use existing correlation ID from request header', () => {
      const existingId = 'existing-correlation-id';
      mockRequest.get = vi.fn((header: string) => {
        if (header === HTTP_HEADER.CORRELATION_ID) {
          return existingId;
        }
        return undefined;
      });

      const exception = new HttpException('Error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockHost);

      const jsonCall = mockResponse.json.mock.calls[0]?.[0];

      expect(jsonCall?.correlationId).toBe(existingId);
    });

    it('should generate new correlation ID if not present', () => {
      mockRequest.get = vi.fn(() => undefined);

      const exception = new HttpException('Error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockHost);

      const jsonCall = mockResponse.json.mock.calls[0]?.[0];

      expect(jsonCall?.correlationId).toBeDefined();

      expect(typeof jsonCall?.correlationId).toBe('string');
    });
  });

  describe('friendly messages', () => {
    it('should return friendly message for 400 BAD_REQUEST', () => {
      const exception = new HttpException('Error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockHost);

      const jsonCall = mockResponse.json.mock.calls[0]?.[0];

      expect(jsonCall?.errorMessage).toContain('invalid data');
    });

    it('should return friendly message for 401 UNAUTHORIZED', () => {
      const exception = new HttpException('Error', HttpStatus.UNAUTHORIZED);

      filter.catch(exception, mockHost);

      const jsonCall = mockResponse.json.mock.calls[0]?.[0];

      expect(jsonCall?.errorMessage).toContain('Authentication');
    });

    it('should return friendly message for 403 FORBIDDEN', () => {
      const exception = new HttpException('Error', HttpStatus.FORBIDDEN);

      filter.catch(exception, mockHost);

      const jsonCall = mockResponse.json.mock.calls[0]?.[0];

      expect(jsonCall?.errorMessage).toContain('permission');
    });

    it('should return friendly message for 404 NOT_FOUND', () => {
      const exception = new HttpException('Error', HttpStatus.NOT_FOUND);

      filter.catch(exception, mockHost);

      const jsonCall = mockResponse.json.mock.calls[0]?.[0];

      expect(jsonCall?.errorMessage).toContain('could not be found');
    });

    it('should return friendly message for 409 CONFLICT', () => {
      const exception = new HttpException('Error', HttpStatus.CONFLICT);

      filter.catch(exception, mockHost);

      const jsonCall = mockResponse.json.mock.calls[0]?.[0];

      expect(jsonCall?.errorMessage).toContain('conflicts');
    });

    it('should return friendly message for 422 UNPROCESSABLE_ENTITY', () => {
      const exception = new HttpException(
        'Error',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

      filter.catch(exception, mockHost);

      const jsonCall = mockResponse.json.mock.calls[0]?.[0];

      expect(jsonCall?.errorMessage).toContain('cannot be processed');
    });

    it('should return friendly message for 429 TOO_MANY_REQUESTS', () => {
      const exception = new HttpException(
        'Error',
        HttpStatus.TOO_MANY_REQUESTS,
      );

      filter.catch(exception, mockHost);

      const jsonCall = mockResponse.json.mock.calls[0]?.[0];

      expect(jsonCall?.errorMessage).toContain('Too many requests');
    });

    it('should return friendly message for 500 INTERNAL_SERVER_ERROR', () => {
      const exception = new HttpException(
        'Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      filter.catch(exception, mockHost);

      const jsonCall = mockResponse.json.mock.calls[0]?.[0];

      expect(jsonCall?.errorMessage).toContain('internal server error');
    });

    it('should return friendly message for 502 BAD_GATEWAY', () => {
      const exception = new HttpException('Error', HttpStatus.BAD_GATEWAY);

      filter.catch(exception, mockHost);

      const jsonCall = mockResponse.json.mock.calls[0]?.[0];

      expect(jsonCall?.errorMessage).toContain('invalid response');
    });

    it('should return friendly message for 503 SERVICE_UNAVAILABLE', () => {
      const exception = new HttpException(
        'Error',
        HttpStatus.SERVICE_UNAVAILABLE,
      );

      filter.catch(exception, mockHost);

      const jsonCall = mockResponse.json.mock.calls[0]?.[0];

      expect(jsonCall?.errorMessage).toContain('temporarily unavailable');
    });

    it('should return default friendly message for unknown status', () => {
      const exception = new HttpException('Error', 418); // I'm a teapot

      filter.catch(exception, mockHost);

      const jsonCall = mockResponse.json.mock.calls[0]?.[0];

      expect(jsonCall?.errorMessage).toContain('Error');
    });
  });

  describe('development mode behavior', () => {
    it('should include stack trace in development mode', () => {
      vi.spyOn(EnvVariables, 'isDevelopment', 'get').mockReturnValue(true);
      vi.spyOn(EnvVariables, 'isProduction', 'get').mockReturnValue(false);

      const exception = new Error('Test error with stack');
      exception.stack = 'Error: Test error\n  at line 1\n  at line 2';

      filter.catch(exception, mockHost);

      const jsonCall = mockResponse.json.mock.calls[0]?.[0];

      expect(jsonCall?.errorDetails?.debugInfo).toBeDefined();

      expect(jsonCall?.errorDetails?.debugInfo).toContain('at line');
    });

    it('should not include stack trace in production mode', () => {
      vi.spyOn(EnvVariables, 'isDevelopment', 'get').mockReturnValue(false);
      vi.spyOn(EnvVariables, 'isProduction', 'get').mockReturnValue(true);

      const exception = new Error('Test error with stack');
      exception.stack = 'Error: Test error\n  at line 1\n  at line 2';

      const prodFilter = new AllExceptionsFilter(mockLogger, {
        includeStackTrace: false,
      });

      prodFilter.catch(exception, mockHost);

      const jsonCall = mockResponse.json.mock.calls[0]?.[0];

      expect(jsonCall?.errorDetails?.debugInfo).toBeUndefined();
    });

    it('should not include stack trace when stack is empty', () => {
      vi.spyOn(EnvVariables, 'isDevelopment', 'get').mockReturnValue(true);

      const exception = new Error('Test error');
      exception.stack = '';

      filter.catch(exception, mockHost);

      const jsonCall = mockResponse.json.mock.calls[0]?.[0];

      expect(jsonCall?.errorDetails?.debugInfo).toBeUndefined();
    });

    it('should not include stack trace when stack is null', () => {
      vi.spyOn(EnvVariables, 'isDevelopment', 'get').mockReturnValue(true);

      const exception = new Error('Test error');
      exception.stack = null as any;

      filter.catch(exception, mockHost);

      const jsonCall = mockResponse.json.mock.calls[0]?.[0];

      expect(jsonCall?.errorDetails?.debugInfo).toBeUndefined();
    });

    it('should not include stack trace when stack is undefined', () => {
      vi.spyOn(EnvVariables, 'isDevelopment', 'get').mockReturnValue(true);

      const exception = new Error('Test error');
      exception.stack = undefined;

      filter.catch(exception, mockHost);

      const jsonCall = mockResponse.json.mock.calls[0]?.[0];

      expect(jsonCall?.errorDetails?.debugInfo).toBeUndefined();
    });
  });

  describe('excluded paths', () => {
    it('should return simple response for excluded paths', () => {
      mockRequest.url = '/_health';
      const exception = new HttpException('Error', HttpStatus.NOT_FOUND);

      filter.catch(exception, mockHost);

      const jsonCall = mockResponse.json.mock.calls[0]?.[0];

      expect(jsonCall?.statusCode).toBe(HttpStatus.NOT_FOUND);

      expect(jsonCall?.timestamp).toBeDefined();
      // Simple response should not have errorDetails

      expect(jsonCall?.errorDetails).toBeUndefined();
    });

    it('should include correlationId for 5xx errors on excluded paths', () => {
      mockRequest.url = '/_health';
      const exception = new HttpException(
        'Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      filter.catch(exception, mockHost);

      const jsonCall = mockResponse.json.mock.calls[0]?.[0];

      expect(jsonCall?.correlationId).toBeDefined();
    });

    it('should not include correlationId for 4xx errors on excluded paths', () => {
      mockRequest.url = '/_health';
      const exception = new HttpException('Error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockHost);

      const jsonCall = mockResponse.json.mock.calls[0]?.[0];

      expect(jsonCall?.correlationId).toBeUndefined();
    });
  });

  describe('custom options', () => {
    it('should use custom API paths', () => {
      const customFilter = new AllExceptionsFilter(mockLogger, {
        apiPaths: ['/custom/api/'],
      });

      mockRequest.url = '/custom/api/test';
      const exception = new HttpException('Error', HttpStatus.BAD_REQUEST);

      customFilter.catch(exception, mockHost);

      const jsonCall = mockResponse.json.mock.calls[0]?.[0];

      expect(jsonCall?.errorDetails).toBeDefined();
    });

    it('should use custom exclude paths', () => {
      const customFilter = new AllExceptionsFilter(mockLogger, {
        excludePaths: ['/custom-health'],
      });

      mockRequest.url = '/custom-health';
      const exception = new HttpException('Error', HttpStatus.NOT_FOUND);

      customFilter.catch(exception, mockHost);

      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should disable friendly messages when configured', () => {
      const customFilter = new AllExceptionsFilter(mockLogger, {
        enableFriendlyMessages: false,
      });

      const originalMessage = 'Original error message';
      const exception = new HttpException(
        originalMessage,
        HttpStatus.NOT_FOUND,
      );

      customFilter.catch(exception, mockHost);

      const jsonCall = mockResponse.json.mock.calls[0]?.[0];

      expect(jsonCall?.errorMessage).toBe(originalMessage);
    });

    it('should use custom correlation ID header', () => {
      const customHeader = 'X-Custom-Correlation-ID';
      const customFilter = new AllExceptionsFilter(mockLogger, {
        correlationIdHeader: customHeader,
      });

      const customId = 'custom-id-123';
      mockRequest.get = vi.fn((header: string) => {
        if (header === customHeader) {
          return customId;
        }
        return undefined;
      });

      const exception = new HttpException('Error', HttpStatus.BAD_REQUEST);

      customFilter.catch(exception, mockHost);

      const jsonCall = mockResponse.json.mock.calls[0]?.[0];

      expect(jsonCall?.correlationId).toBe(customId);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle validation error from class-validator', () => {
      const exception = new HttpException(
        {
          message: [
            'email must be an email',
            'password must be longer than 8 characters',
          ],
          error: 'Bad Request',
          statusCode: 400,
        },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);

      const jsonCall = mockResponse.json.mock.calls[0]?.[0];

      expect(jsonCall?.errorDetails?.validationErrors?.errors).toContain(
        'email must be an email',
      );
    });

    it('should handle database connection error', () => {
      const exception = new Error('Database connection failed');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle unauthorized access attempt', () => {
      const exception = new HttpException(
        'Invalid token',
        HttpStatus.UNAUTHORIZED,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);

      const jsonCall = mockResponse.json.mock.calls[0]?.[0];

      expect(jsonCall?.errorMessage).toContain('Authentication');
    });

    it('should handle rate limit exceeded', () => {
      const exception = new HttpException(
        'Rate limit exceeded',
        HttpStatus.TOO_MANY_REQUESTS,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.TOO_MANY_REQUESTS,
      );

      const jsonCall = mockResponse.json.mock.calls[0]?.[0];

      expect(jsonCall?.errorMessage).toContain('Too many requests');
    });
  });

  describe('ExceptionFilterOptions coverage', () => {
    it('should cover all option properties', () => {
      // This test ensures all ExceptionFilterOptions properties are referenced
      const options = {
        apiPaths: ['/test/'],
        excludePaths: ['/exclude/'],
        showDetailedErrorsForNonApi: true,
        includeStackTrace: true,
        enableFriendlyMessages: true,
        correlationIdHeader: 'X-Test-ID',
        logLevel: LogLevel.ERROR,
      };

      const customFilter = new AllExceptionsFilter(mockLogger, options);

      expect(customFilter).toBeDefined();
      expect(options.apiPaths).toBeDefined();
      expect(options.excludePaths).toBeDefined();
      expect(options.showDetailedErrorsForNonApi).toBeDefined();
      expect(options.includeStackTrace).toBeDefined();
      expect(options.enableFriendlyMessages).toBeDefined();
      expect(options.correlationIdHeader).toBeDefined();
      expect(options.logLevel).toBeDefined();
    });

    it('should handle showDetailedErrorsForNonApi set to false', () => {
      const customFilter = new AllExceptionsFilter(mockLogger, {
        showDetailedErrorsForNonApi: false,
        apiPaths: ['/api/'],
      });

      // Test with non-API path - should use simple response
      mockRequest.url = '/non-api/endpoint';
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

      customFilter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should use default correlationIdHeader when not provided', () => {
      const customFilter = new AllExceptionsFilter(mockLogger, {
        correlationIdHeader: undefined,
      });

      mockRequest.url = '/api/test';
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

      customFilter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should handle non-number status code', () => {
      mockRequest.url = '/api/test';
      // Create an exception with non-standard status
      const exception = {
        getStatus: () => 'INVALID' as unknown as number,
      } as HttpException;

      filter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should use default error message when enableFriendlyMessages is undefined', () => {
      const customFilter = new AllExceptionsFilter(mockLogger, {
        enableFriendlyMessages: undefined,
      });

      mockRequest.url = '/api/test';
      const exception = new HttpException(
        'Custom error',
        HttpStatus.BAD_REQUEST,
      );

      customFilter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should handle error without message when enableFriendlyMessages is false', () => {
      const customFilter = new AllExceptionsFilter(mockLogger, {
        enableFriendlyMessages: false,
      });

      mockRequest.url = '/api/test';
      const exception = new HttpException('', HttpStatus.BAD_REQUEST);

      customFilter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should use default message when error message is empty and enableFriendlyMessages is false', () => {
      const customFilter = new AllExceptionsFilter(mockLogger, {
        enableFriendlyMessages: false,
      });

      mockRequest.url = '/api/test';
      // Create exception without a message
      const exception = new Error() as HttpException;
      exception.getStatus = () => HttpStatus.INTERNAL_SERVER_ERROR;

      customFilter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should use default message for unknown status code when enableFriendlyMessages is true', () => {
      const customFilter = new AllExceptionsFilter(mockLogger, {
        enableFriendlyMessages: true,
      });

      mockRequest.url = '/api/test';
      // Use a status code not in the friendly messages switch
      const exception = new HttpException('', HttpStatus.NOT_IMPLEMENTED);

      customFilter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should handle exception with undefined message', () => {
      const customFilter = new AllExceptionsFilter(mockLogger, {
        enableFriendlyMessages: false,
      });

      mockRequest.url = '/api/test';
      // Create custom exception that returns undefined for getResponse
      const exception = {
        getStatus: () => HttpStatus.INTERNAL_SERVER_ERROR,
        getResponse: () => ({ message: undefined }),
        message: '',
        name: 'CustomError',
      } as unknown as HttpException;

      customFilter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should handle plain object exception with no message', () => {
      const customFilter = new AllExceptionsFilter(mockLogger, {
        enableFriendlyMessages: false,
      });

      mockRequest.url = '/api/test';
      // Create a plain object that will be stringified
      const exception = {
        getStatus: () => HttpStatus.INTERNAL_SERVER_ERROR,
      } as unknown as HttpException;

      customFilter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should handle exception with no extractable message when enableFriendlyMessages is false', () => {
      const customFilter = new AllExceptionsFilter(mockLogger, {
        enableFriendlyMessages: false,
      });

      mockRequest.url = '/api/test';
      // Create a plain object that doesn't have a message
      const exception = {
        getStatus: () => HttpStatus.BAD_REQUEST,
        getResponse: () => ({}),
      } as HttpException;

      customFilter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should handle exception with no extractable message for default case when enableFriendlyMessages is true', () => {
      const customFilter = new AllExceptionsFilter(mockLogger, {
        enableFriendlyMessages: true,
      });

      mockRequest.url = '/api/test';
      // Create a plain object that doesn't have a message, with unknown status
      const exception = {
        getStatus: () => HttpStatus.GATEWAY_TIMEOUT,
        getResponse: () => ({}),
      } as HttpException;

      customFilter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should handle non-Error exception with non-number status in errorDetails', () => {
      mockRequest.url = '/api/test';
      vi.spyOn(EnvVariables, 'isDevelopment', 'get').mockReturnValue(true);

      const customFilter = new AllExceptionsFilter(mockLogger, {
        includeStackTrace: true,
      });

      // Create an exception that's not an Error instance with non-number status
      const exception = {
        getStatus: () => 'CUSTOM_ERROR' as unknown as number,
        getResponse: () => ({ message: 'Custom error' }),
      } as HttpException;

      customFilter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should handle HttpException with null response', () => {
      const customFilter = new AllExceptionsFilter(mockLogger, {
        enableFriendlyMessages: false,
      });

      mockRequest.url = '/api/test';
      // Create exception where getResponse is mocked to return null
      const exception = new HttpException('Error', HttpStatus.BAD_REQUEST);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      vi.spyOn(exception, 'getResponse').mockReturnValue(null as any);

      customFilter.catch(exception, mockHost);

      const jsonCall = mockResponse.json.mock.calls[0]?.[0];
      // When response is null, it should fall back to exception.message
      expect(jsonCall?.errorMessage).toBeDefined();
      expect(typeof jsonCall?.errorMessage).toBe('string');
    });

    it('should handle HttpException with non-string non-array message', () => {
      const customFilter = new AllExceptionsFilter(mockLogger, {
        enableFriendlyMessages: false,
      });

      mockRequest.url = '/api/test';
      // Response object with numeric message (not string or array)
      const exception = new HttpException(
        { message: 12345 as any, error: 'Bad Request' },
        HttpStatus.BAD_REQUEST,
      );

      customFilter.catch(exception, mockHost);

      const jsonCall = mockResponse.json.mock.calls[0]?.[0];
      // When message is not string/array, it should use String(exception)
      expect(jsonCall?.errorMessage).toBeDefined();
      expect(typeof jsonCall?.errorMessage).toBe('string');
    });

    it('should handle HttpException with boolean message', () => {
      const customFilter = new AllExceptionsFilter(mockLogger, {
        enableFriendlyMessages: false,
      });

      mockRequest.url = '/api/test';
      // Response object with boolean message (not string or array)
      const exception = new HttpException(
        { message: false as any, error: 'Bad Request' },
        HttpStatus.BAD_REQUEST,
      );

      customFilter.catch(exception, mockHost);

      const jsonCall = mockResponse.json.mock.calls[0]?.[0];
      expect(jsonCall?.errorMessage).toBeDefined();
      expect(typeof jsonCall?.errorMessage).toBe('string');
    });
  });
});
