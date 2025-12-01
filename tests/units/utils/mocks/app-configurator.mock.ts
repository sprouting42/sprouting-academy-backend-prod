import type { INestApplication } from '@nestjs/common';
import { vi } from 'vitest';

import '../../modules/logger/mocks/logger.mock';

import type { AppLoggerService } from '@/modules/logger/services/app-logger.service';

// Mock helmet
vi.mock('helmet', () => ({
  default: vi.fn(() => 'helmet-middleware'),
}));

// Mock compression
vi.mock('compression', () => ({
  default: vi.fn(() => 'compression-middleware'),
}));

// Mock @scalar/nestjs-api-reference
vi.mock('@scalar/nestjs-api-reference', () => ({
  apiReference: vi.fn(() => 'scalar-middleware'),
}));

export const createMockLogger = (): AppLoggerService =>
  ({
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    verbose: vi.fn(),
  }) as unknown as AppLoggerService;

export const createMockApp = (
  mockLogger: AppLoggerService,
): INestApplication => {
  const mockContainer = {
    getModules: vi.fn().mockReturnValue(new Map()),
  };

  return {
    use: vi.fn(),
    enableCors: vi.fn(),
    useLogger: vi.fn(),
    useGlobalPipes: vi.fn(),
    setGlobalPrefix: vi.fn(),
    useGlobalInterceptors: vi.fn(),
    useGlobalFilters: vi.fn(),
    get: vi.fn().mockReturnValue(mockLogger),
    getHttpAdapter: vi.fn().mockReturnValue({
      getInstance: vi.fn().mockReturnValue({}),
      getType: vi.fn().mockReturnValue('express'),
    }),
    select: vi.fn().mockReturnValue(mockContainer),
    container: mockContainer,
  } as unknown as INestApplication;
};
