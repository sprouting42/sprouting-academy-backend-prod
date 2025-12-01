import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { vi } from 'vitest';

import '../../../modules/logger/mocks/logger.mock';

import type { AppLoggerService } from '@/modules/logger/services/app-logger.service';

export const createMockLogger = (): AppLoggerService =>
  ({
    log: vi.fn(),
  }) as unknown as AppLoggerService;

export const createMockExecutionContext = (): ExecutionContext => {
  const mockRequest = {
    method: 'GET',
    url: '/api/test',
  };

  const mockResponse = {
    statusCode: 200,
  };

  return {
    switchToHttp: vi.fn().mockReturnValue({
      getRequest: vi.fn().mockReturnValue(mockRequest),
      getResponse: vi.fn().mockReturnValue(mockResponse),
    }),
  } as unknown as ExecutionContext;
};

export const createMockCallHandler = (): CallHandler =>
  ({
    handle: vi.fn().mockReturnValue(of('test response')),
  }) as unknown as CallHandler;
