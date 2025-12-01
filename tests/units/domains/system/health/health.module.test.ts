/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { describe, expect, it } from 'vitest';

// Import with side effect to ensure coverage tracking
import '@/domains/system/health/health.module';
import { HealthController } from '@/domains/system/health/controller/health.controller';
import { HealthModule } from '@/domains/system/health/health.module';

describe('HealthModule', () => {
  it('should be defined', () => {
    expect(HealthModule).toBeDefined();
  });

  it('should be a module class', () => {
    expect(typeof HealthModule).toBe('function');
  });

  it('should have HealthController', () => {
    const metadata = Reflect.getMetadata('controllers', HealthModule);
    expect(metadata).toBeDefined();
    expect(Array.isArray(metadata)).toBe(true);
    expect(metadata).toContain(HealthController);
  });
});
