import type { ArgumentsHost } from '@nestjs/common';
import { vi } from 'vitest';

import '../../../modules/logger/mocks/logger.mock';

import type { AppLoggerService } from '@/modules/logger/services/app-logger.service';

export const createMockLogger = (): AppLoggerService =>
  ({
    error: vi.fn(),
    log: vi.fn(),
    warn: vi.fn(),
  }) as unknown as AppLoggerService;

export const createMockResponse = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
});

export const createMockRequest = () => ({
  method: 'GET',
  url: '/api/v1/test',
  get: vi.fn(),
});

export const createMockHost = (
  mockResponse: ReturnType<typeof createMockResponse>,
  mockRequest: ReturnType<typeof createMockRequest>,
): ArgumentsHost =>
  ({
    switchToHttp: vi.fn().mockReturnValue({
      getResponse: vi.fn().mockReturnValue(mockResponse),
      getRequest: vi.fn().mockReturnValue(mockRequest),
    }),
  }) as unknown as ArgumentsHost;
