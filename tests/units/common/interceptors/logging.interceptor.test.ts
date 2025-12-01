/* eslint-disable @typescript-eslint/unbound-method */

import './mocks/logging.interceptor.mock';
import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';
import type { AppLoggerService } from '@/modules/logger/services/app-logger.service';

import {
  createMockCallHandler,
  createMockExecutionContext,
  createMockLogger,
} from './mocks/logging.interceptor.mock';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let mockLogger: AppLoggerService;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockExecutionContext = createMockExecutionContext();
    mockCallHandler = createMockCallHandler();
    interceptor = new LoggingInterceptor(mockLogger);
  });

  describe('intercept', () => {
    it('should create interceptor instance', () => {
      expect(interceptor).toBeDefined();
      expect(interceptor).toBeInstanceOf(LoggingInterceptor);
    });

    it('should call next.handle() and log details', () => {
      const result = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      expect(result).toBeDefined();

      result.subscribe(() => {
        const handleSpy = mockCallHandler.handle as ReturnType<typeof vi.fn>;
        expect(handleSpy).toHaveBeenCalled();

        const logSpy = mockLogger.log as ReturnType<typeof vi.fn>;
        expect(logSpy).toHaveBeenCalled();
        const logCall = logSpy.mock.calls[0];
        expect(logCall?.[0]).toContain('GET');
        expect(logCall?.[0]).toContain('/api/test');
        expect(logCall?.[0]).toContain('200');
        expect(logCall?.[1]).toBe(LoggingInterceptor.name);
      });
    });

    it('should measure response time', () => {
      const result = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result.subscribe(() => {
        const logSpy = mockLogger.log as ReturnType<typeof vi.fn>;
        const logCall = logSpy.mock.calls[0];
        expect(logCall?.[0]).toMatch(/\d+ms/);
      });
    });

    it('should handle POST requests', () => {
      const postRequest = {
        method: 'POST',
        url: '/api/users',
      };

      const postResponse = {
        statusCode: 201,
      };

      const postContext = {
        switchToHttp: vi.fn().mockReturnValue({
          getRequest: vi.fn().mockReturnValue(postRequest),
          getResponse: vi.fn().mockReturnValue(postResponse),
        }),
      } as unknown as ExecutionContext;

      const result = interceptor.intercept(postContext, mockCallHandler);

      result.subscribe(() => {
        const logSpy = mockLogger.log as ReturnType<typeof vi.fn>;
        const logCall = logSpy.mock.calls[0];
        expect(logCall?.[0]).toContain('POST');
        expect(logCall?.[0]).toContain('/api/users');
        expect(logCall?.[0]).toContain('201');
      });
    });

    it('should handle error status codes', () => {
      const errorResponse = {
        statusCode: 500,
      };

      const errorContext = {
        switchToHttp: vi.fn().mockReturnValue({
          getRequest: vi.fn().mockReturnValue({
            method: 'GET',
            url: '/api/error',
          }),
          getResponse: vi.fn().mockReturnValue(errorResponse),
        }),
      } as unknown as ExecutionContext;

      const result = interceptor.intercept(errorContext, mockCallHandler);

      result.subscribe(() => {
        const logSpy = mockLogger.log as ReturnType<typeof vi.fn>;
        const logCall = logSpy.mock.calls[0];
        expect(logCall?.[0]).toContain('500');
      });
    });

    it('should return observable from next.handle()', () => {
      const result = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      expect(result).toBeDefined();
      result.subscribe(value => {
        expect(value).toBe('test response');
      });
    });
  });

  describe('real-world scenarios', () => {
    it('should log typical API request', () => {
      const apiContext = {
        switchToHttp: vi.fn().mockReturnValue({
          getRequest: vi.fn().mockReturnValue({
            method: 'GET',
            url: '/api/v1/users/123',
          }),
          getResponse: vi.fn().mockReturnValue({
            statusCode: 200,
          }),
        }),
      } as unknown as ExecutionContext;

      const result = interceptor.intercept(apiContext, mockCallHandler);

      result.subscribe(() => {
        const logSpy = mockLogger.log as ReturnType<typeof vi.fn>;
        expect(logSpy).toHaveBeenCalled();
        const logMessage = logSpy.mock.calls[0]?.[0] as string;
        expect(logMessage).toContain('GET');
        expect(logMessage).toContain('/api/v1/users/123');
        expect(logMessage).toContain('200');
        expect(logMessage).toMatch(/\d+ms$/);
      });
    });
  });
});
