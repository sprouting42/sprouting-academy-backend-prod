/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { describe, expect, it } from 'vitest';

// Import with side effect to ensure coverage tracking
import '@/domains/system/system.module';
import { HealthModule } from '@/domains/system/health/health.module';
import { SystemModule } from '@/domains/system/system.module';

describe('SystemModule', () => {
  it('should be defined', () => {
    expect(SystemModule).toBeDefined();
  });

  it('should be a module class', () => {
    expect(typeof SystemModule).toBe('function');
  });

  it('should import HealthModule', () => {
    const metadata = Reflect.getMetadata('imports', SystemModule);
    expect(metadata).toBeDefined();
    expect(Array.isArray(metadata)).toBe(true);
    expect(metadata).toContain(HealthModule);
  });
});
