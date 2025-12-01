/* eslint-disable @typescript-eslint/no-unsafe-return */
import { vi } from 'vitest';

// Mock @nestjs/throttler
vi.mock('@nestjs/throttler', () => ({
  Throttle: vi.fn(config => config),
  SkipThrottle: vi.fn(() => 'SkipThrottle'),
}));

// Mock API constants
vi.mock('@/constants/api', () => ({
  API_CONFIG: {
    VERSION: 'v1',
    PREFIX: 'api',
    HEALTH_PATH: '_health',
    DOCS_PATH: 'docs',
  },
  API_RATE_LIMITS: {
    STRICT: { ttl: 60000, limit: 3 },
    MODERATE: { ttl: 60000, limit: 30 },
    LENIENT: { ttl: 60000, limit: 100 },
    BURST: { ttl: 1000, limit: 10 },
  },
  THROTTLERS_CONFIG: [
    { key: 'strict', ttl: 60000, limit: 3 },
    { key: 'moderate', ttl: 60000, limit: 30 },
    { key: 'lenient', ttl: 60000, limit: 100 },
    { key: 'burst', ttl: 1000, limit: 10 },
  ],
}));
