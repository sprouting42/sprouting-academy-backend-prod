/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { describe, expect, it } from 'vitest';

import './mocks/config.module.mock';

import { ConfigModule } from '@/modules/config/config.module';

describe('ConfigModule', () => {
  it('should be defined', () => {
    expect(ConfigModule).toBeDefined();
  });

  it('should be a module class', () => {
    expect(typeof ConfigModule).toBe('function');
  });

  it('should import NestConfigModule', () => {
    const metadata = Reflect.getMetadata('imports', ConfigModule);
    expect(metadata).toBeDefined();
    expect(Array.isArray(metadata)).toBe(true);
    expect(metadata.length).toBeGreaterThan(0);
  });
});
