/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { vi } from 'vitest';

vi.mock('@nestjs/throttler', () => ({
  ThrottlerModule: {
    forRootAsync: vi.fn(config => {
      if (typeof config.useFactory === 'function') {
        config.useFactory();
      }
      return {
        module: 'ThrottlerModule',
        providers: [],
        exports: [],
      };
    }),
  },
  Throttle: vi.fn(() => vi.fn()),
  SkipThrottle: vi.fn(() => vi.fn()),
}));
