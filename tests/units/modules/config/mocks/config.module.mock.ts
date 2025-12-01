/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { vi } from 'vitest';
vi.mock('@nestjs/config', () => ({
  ConfigModule: {
    forRoot: vi.fn(config => {
      if (typeof config.validate === 'function') {
        config.validate({
          NODE_ENV: 'test',
          DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
          PORT: '3000',
          ALLOW_URL: 'http://localhost:3000',
          API_VERSION: 'v1',
          OMISE_PUBLIC_KEY: 'test-public-key',
          OMISE_SECRET_KEY: 'test-secret-key',
          SUPABASE_URL: 'https://test.supabase.co',
          SUPABASE_ANON_KEY: 'test-anon-key',
        });
      }
      return {
        module: 'ConfigModule',
        providers: [],
        exports: [],
      };
    }),
  },
  ConfigService: vi.fn(),
}));
