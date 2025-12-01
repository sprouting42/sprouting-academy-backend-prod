/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { vi } from 'vitest';
import type { Logger } from 'winston';

vi.mock('winston', async () => {
  const actual = await vi.importActual('winston');
  return {
    ...actual,
    format: {
      combine: vi.fn().mockReturnValue({}),
      timestamp: vi.fn().mockReturnValue({}),
      errors: vi.fn().mockReturnValue({}),
      splat: vi.fn().mockReturnValue({}),
      json: vi.fn().mockReturnValue({}),
      colorize: vi.fn().mockReturnValue({}),
      printf: vi.fn().mockReturnValue({}),
      simple: vi.fn().mockReturnValue({}),
    },
    transports: {
      Console: vi.fn(),
      File: vi.fn(),
    },
    createLogger: vi.fn(() => ({
      log: vi.fn(),
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      verbose: vi.fn(),
    })),
  };
});

vi.mock('nest-winston', () => ({
  WinstonModule: {
    forRootAsync: vi.fn(config => {
      if (typeof config.useFactory === 'function') {
        config.useFactory();
      }
      return {
        module: 'WinstonModule',
        providers: [],
        exports: [],
      };
    }),
  },
  WINSTON_MODULE_NEST_PROVIDER: 'winston',
}));

/**
 * Creates a mock Winston Logger instance
 */
export const createMockLogger = (): Logger => {
  return {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    verbose: vi.fn(),
  } as unknown as Logger;
};
