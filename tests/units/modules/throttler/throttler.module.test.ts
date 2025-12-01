/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { describe, expect, it } from 'vitest';

import './mocks/throttler.module.mock';

import { ThrottlerModule } from '@/modules/throttler/throttler.module';

describe('ThrottlerModule', () => {
  it('should be defined', () => {
    expect(ThrottlerModule).toBeDefined();
  });

  it('should be a module class', () => {
    expect(typeof ThrottlerModule).toBe('function');
  });

  it('should import NestThrottlerModule', () => {
    const metadata = Reflect.getMetadata('imports', ThrottlerModule);
    expect(metadata).toBeDefined();
    expect(Array.isArray(metadata)).toBe(true);
    expect(metadata.length).toBeGreaterThan(0);
  });

  it('should export NestThrottlerModule', () => {
    const metadata = Reflect.getMetadata('exports', ThrottlerModule);
    expect(metadata).toBeDefined();
    expect(Array.isArray(metadata)).toBe(true);
  });
});
