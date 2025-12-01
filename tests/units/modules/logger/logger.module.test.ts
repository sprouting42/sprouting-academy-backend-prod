/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { describe, expect, it } from 'vitest';

import './mocks/logger.mock';

import { LoggerModule } from '@/modules/logger/logger.module';
import { AppLoggerService } from '@/modules/logger/services/app-logger.service';

describe('LoggerModule', () => {
  it('should be defined', () => {
    expect(LoggerModule).toBeDefined();
  });

  it('should be a module class', () => {
    expect(typeof LoggerModule).toBe('function');
  });

  it('should export AppLoggerService', () => {
    const metadata = Reflect.getMetadata('exports', LoggerModule);
    expect(metadata).toContain(AppLoggerService);
  });

  it('should provide AppLoggerService', () => {
    const metadata = Reflect.getMetadata('providers', LoggerModule);
    expect(metadata).toContain(AppLoggerService);
  });

  it('should import WinstonModule', () => {
    const metadata = Reflect.getMetadata('imports', LoggerModule);
    expect(metadata).toBeDefined();
    expect(Array.isArray(metadata)).toBe(true);
    expect(metadata.length).toBeGreaterThan(0);
  });
});
