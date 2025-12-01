/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { beforeEach, describe, it, expect, afterEach } from 'vitest';

import { NodeEnv } from '@/enums/node-env.enum';
import { EnvVariables } from '@/modules/config/dto/config.dto';

describe('EnvVariables', () => {
  // Reset instance before each test
  beforeEach(() => {
    // Reset the singleton instance using type assertion
    (EnvVariables as any)._instance = null;
  });

  afterEach(() => {
    // Clean up after each test
    (EnvVariables as any)._instance = null;
  });

  describe('initialize', () => {
    it('should initialize EnvVariables with valid configuration', () => {
      const config = {
        NODE_ENV: NodeEnv.DEVELOPMENT,
        PORT: 3000,
        JWT_SECRET: 'test-secret-key',
        ALLOW_URL: 'http://localhost:3001',
        API_VERSION: 'v1',
        DATABASE_URL: 'postgresql://localhost:5432/test',
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_ANON_KEY: 'test-anon-key',
        OMISE_SECRET_KEY: 'test-omise-secret-key',
        OMISE_PUBLIC_KEY: 'test-omise-public-key',
      };

      const result = EnvVariables.initialize(config);

      expect(result).toBeInstanceOf(EnvVariables);
      expect(result.NODE_ENV).toBe(NodeEnv.DEVELOPMENT);
      expect(result.PORT).toBe(3000);
      expect(result.JWT_SECRET).toBe('test-secret-key');
      expect(result.ALLOW_URL).toBe('http://localhost:3001');
      expect(result.API_VERSION).toBe('v1');
      expect(result.DATABASE_URL).toBe('postgresql://localhost:5432/test');
    });

    it('should initialize with production environment', () => {
      const config = {
        NODE_ENV: NodeEnv.PRODUCTION,
        PORT: 8080,
        JWT_SECRET: 'production-secret',
        ALLOW_URL: 'https://example.com',
        API_VERSION: 'v2',
        DATABASE_URL: 'postgresql://production:5432/db',
        SUPABASE_URL: 'https://prod.supabase.co',
        SUPABASE_ANON_KEY: 'prod-anon-key',
        OMISE_SECRET_KEY: 'prod-omise-secret-key',
        OMISE_PUBLIC_KEY: 'prod-omise-public-key',
      };

      const result = EnvVariables.initialize(config);

      expect(result.NODE_ENV).toBe(NodeEnv.PRODUCTION);
      expect(result.PORT).toBe(8080);
    });

    it('should initialize with test environment', () => {
      const config = {
        NODE_ENV: NodeEnv.TEST,
        PORT: 3002,
        JWT_SECRET: 'test-secret',
        ALLOW_URL: 'http://localhost:3002',
        API_VERSION: 'v1',
        DATABASE_URL: 'postgresql://localhost:5432/test',
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_ANON_KEY: 'test-anon-key',
        OMISE_SECRET_KEY: 'test-omise-secret-key',
        OMISE_PUBLIC_KEY: 'test-omise-public-key',
      };

      const result = EnvVariables.initialize(config);

      expect(result.NODE_ENV).toBe(NodeEnv.TEST);
    });

    it('should return existing instance on subsequent calls (singleton)', () => {
      const config1 = {
        NODE_ENV: NodeEnv.DEVELOPMENT,
        PORT: 3000,
        JWT_SECRET: 'secret1',
        ALLOW_URL: 'http://localhost:3000',
        API_VERSION: 'v1',
        DATABASE_URL: 'postgresql://localhost:5432/test',
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_ANON_KEY: 'test-anon-key',
        OMISE_SECRET_KEY: 'test-omise-secret-key',
        OMISE_PUBLIC_KEY: 'test-omise-public-key',
      };

      const config2 = {
        NODE_ENV: NodeEnv.PRODUCTION,
        PORT: 8080,
        JWT_SECRET: 'secret2',
        ALLOW_URL: 'https://example.com',
        API_VERSION: 'v2',
        DATABASE_URL: 'postgresql://production:5432/db',
        SUPABASE_URL: 'https://prod.supabase.co',
        SUPABASE_ANON_KEY: 'prod-anon-key',
        OMISE_SECRET_KEY: 'prod-omise-secret-key',
        OMISE_PUBLIC_KEY: 'prod-omise-public-key',
      };

      const instance1 = EnvVariables.initialize(config1);
      const instance2 = EnvVariables.initialize(config2);

      expect(instance1).toBe(instance2);
      expect(instance1.PORT).toBe(3000); // Should keep first config
      expect(instance2.PORT).toBe(3000); // Should not change
    });

    it('should throw error for invalid configuration', () => {
      const invalidConfig = {
        NODE_ENV: 'invalid-env',
        PORT: 'not-a-number',
      };

      expect(() => EnvVariables.initialize(invalidConfig)).toThrow(
        'Environment validation error',
      );
    });

    it('should throw error for missing required fields', () => {
      const incompleteConfig = {
        NODE_ENV: NodeEnv.DEVELOPMENT,
        // Missing PORT, JWT_SECRET, etc.
      };

      expect(() => EnvVariables.initialize(incompleteConfig)).toThrow(
        'Environment validation error',
      );
    });

    it('should allow unknown fields (allowUnknown: true)', () => {
      const config = {
        NODE_ENV: NodeEnv.DEVELOPMENT,
        PORT: 3000,
        JWT_SECRET: 'test-secret',
        ALLOW_URL: 'http://localhost:3000',
        API_VERSION: 'v1',
        DATABASE_URL: 'postgresql://localhost:5432/test',
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_ANON_KEY: 'test-anon-key',
        OMISE_SECRET_KEY: 'test-omise-secret-key',
        OMISE_PUBLIC_KEY: 'test-omise-public-key',
        EXTRA_FIELD: 'this should be allowed',
        ANOTHER_FIELD: 123,
      };

      expect(() => EnvVariables.initialize(config)).not.toThrow();
    });

    it('should handle string port number and convert to number', () => {
      const config = {
        NODE_ENV: NodeEnv.DEVELOPMENT,
        PORT: '3000',
        JWT_SECRET: 'test-secret',
        ALLOW_URL: 'http://localhost:3000',
        API_VERSION: 'v1',
        DATABASE_URL: 'postgresql://localhost:5432/test',
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_ANON_KEY: 'test-anon-key',
        OMISE_SECRET_KEY: 'test-omise-secret-key',
        OMISE_PUBLIC_KEY: 'test-omise-public-key',
      };

      const result = EnvVariables.initialize(config);

      expect(result.PORT).toBe(3000);
      expect(typeof result.PORT).toBe('number');
    });
  });

  describe('instance getter', () => {
    it('should return initialized instance', () => {
      const config = {
        NODE_ENV: NodeEnv.DEVELOPMENT,
        PORT: 3000,
        JWT_SECRET: 'test-secret',
        ALLOW_URL: 'http://localhost:3000',
        API_VERSION: 'v1',
        DATABASE_URL: 'postgresql://localhost:5432/test',
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_ANON_KEY: 'test-anon-key',
        OMISE_SECRET_KEY: 'test-omise-secret-key',
        OMISE_PUBLIC_KEY: 'test-omise-public-key',
      };

      EnvVariables.initialize(config);
      const instance = EnvVariables.instance;

      expect(instance).toBeInstanceOf(EnvVariables);
      expect(instance.NODE_ENV).toBe(NodeEnv.DEVELOPMENT);
    });

    it('should throw error if not initialized', () => {
      expect(() => EnvVariables.instance).toThrow(
        'EnvVariables not initialized. Call EnvVariables.initialize first.',
      );
    });

    it('should return same instance on multiple calls', () => {
      const config = {
        NODE_ENV: NodeEnv.DEVELOPMENT,
        PORT: 3000,
        JWT_SECRET: 'test-secret',
        ALLOW_URL: 'http://localhost:3000',
        API_VERSION: 'v1',
        DATABASE_URL: 'postgresql://localhost:5432/test',
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_ANON_KEY: 'test-anon-key',
        OMISE_SECRET_KEY: 'test-omise-secret-key',
        OMISE_PUBLIC_KEY: 'test-omise-public-key',
      };

      EnvVariables.initialize(config);

      const instance1 = EnvVariables.instance;
      const instance2 = EnvVariables.instance;

      expect(instance1).toBe(instance2);
    });
  });

  describe('isDevelopment getter', () => {
    it('should return true for development environment', () => {
      const config = {
        NODE_ENV: NodeEnv.DEVELOPMENT,
        PORT: 3000,
        JWT_SECRET: 'test-secret',
        ALLOW_URL: 'http://localhost:3000',
        API_VERSION: 'v1',
        DATABASE_URL: 'postgresql://localhost:5432/test',
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_ANON_KEY: 'test-anon-key',
        OMISE_SECRET_KEY: 'test-omise-secret-key',
        OMISE_PUBLIC_KEY: 'test-omise-public-key',
      };

      EnvVariables.initialize(config);

      expect(EnvVariables.isDevelopment).toBe(true);
    });

    it('should return false for production environment', () => {
      const config = {
        NODE_ENV: NodeEnv.PRODUCTION,
        PORT: 8080,
        JWT_SECRET: 'prod-secret',
        ALLOW_URL: 'https://example.com',
        API_VERSION: 'v1',
        DATABASE_URL: 'postgresql://prod:5432/db',
        SUPABASE_URL: 'https://prod.supabase.co',
        SUPABASE_ANON_KEY: 'prod-anon-key',
        OMISE_SECRET_KEY: 'prod-omise-secret-key',
        OMISE_PUBLIC_KEY: 'prod-omise-public-key',
      };

      EnvVariables.initialize(config);

      expect(EnvVariables.isDevelopment).toBe(false);
    });

    it('should return false for test environment', () => {
      const config = {
        NODE_ENV: NodeEnv.TEST,
        PORT: 3002,
        JWT_SECRET: 'test-secret',
        ALLOW_URL: 'http://localhost:3002',
        API_VERSION: 'v1',
        DATABASE_URL: 'postgresql://localhost:5432/test',
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_ANON_KEY: 'test-anon-key',
        OMISE_SECRET_KEY: 'test-omise-secret-key',
        OMISE_PUBLIC_KEY: 'test-omise-public-key',
      };

      EnvVariables.initialize(config);

      expect(EnvVariables.isDevelopment).toBe(false);
    });

    it('should return false when not initialized', () => {
      expect(EnvVariables.isDevelopment).toBe(false);
    });
  });

  describe('isProduction getter', () => {
    it('should return true for production environment', () => {
      const config = {
        NODE_ENV: NodeEnv.PRODUCTION,
        PORT: 8080,
        JWT_SECRET: 'prod-secret',
        ALLOW_URL: 'https://example.com',
        API_VERSION: 'v1',
        DATABASE_URL: 'postgresql://prod:5432/db',
        SUPABASE_URL: 'https://prod.supabase.co',
        SUPABASE_ANON_KEY: 'prod-anon-key',
        OMISE_SECRET_KEY: 'prod-omise-secret-key',
        OMISE_PUBLIC_KEY: 'prod-omise-public-key',
      };

      EnvVariables.initialize(config);

      expect(EnvVariables.isProduction).toBe(true);
    });

    it('should return false for development environment', () => {
      const config = {
        NODE_ENV: NodeEnv.DEVELOPMENT,
        PORT: 3000,
        JWT_SECRET: 'test-secret',
        ALLOW_URL: 'http://localhost:3000',
        API_VERSION: 'v1',
        DATABASE_URL: 'postgresql://localhost:5432/test',
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_ANON_KEY: 'test-anon-key',
        OMISE_SECRET_KEY: 'test-omise-secret-key',
        OMISE_PUBLIC_KEY: 'test-omise-public-key',
      };

      EnvVariables.initialize(config);

      expect(EnvVariables.isProduction).toBe(false);
    });

    it('should return false for test environment', () => {
      const config = {
        NODE_ENV: NodeEnv.TEST,
        PORT: 3002,
        JWT_SECRET: 'test-secret',
        ALLOW_URL: 'http://localhost:3002',
        API_VERSION: 'v1',
        DATABASE_URL: 'postgresql://localhost:5432/test',
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_ANON_KEY: 'test-anon-key',
        OMISE_SECRET_KEY: 'test-omise-secret-key',
        OMISE_PUBLIC_KEY: 'test-omise-public-key',
      };

      EnvVariables.initialize(config);

      expect(EnvVariables.isProduction).toBe(false);
    });

    it('should return false when not initialized', () => {
      expect(EnvVariables.isProduction).toBe(false);
    });
  });

  describe('Environment-specific configurations', () => {
    it('should handle different database URLs', () => {
      const config = {
        NODE_ENV: NodeEnv.DEVELOPMENT,
        PORT: 3000,
        JWT_SECRET: 'secret',
        ALLOW_URL: 'http://localhost:3000',
        API_VERSION: 'v1',
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/mydb',
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_ANON_KEY: 'test-anon-key',
        OMISE_SECRET_KEY: 'test-omise-secret-key',
        OMISE_PUBLIC_KEY: 'test-omise-public-key',
      };

      const result = EnvVariables.initialize(config);

      expect(result.DATABASE_URL).toBe(
        'postgresql://user:pass@localhost:5432/mydb',
      );
    });

    it('should handle different API versions', () => {
      const config = {
        NODE_ENV: NodeEnv.DEVELOPMENT,
        PORT: 3000,
        JWT_SECRET: 'secret',
        ALLOW_URL: 'http://localhost:3000',
        API_VERSION: 'v2',
        DATABASE_URL: 'postgresql://localhost:5432/test',
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_ANON_KEY: 'test-anon-key',
        OMISE_SECRET_KEY: 'test-omise-secret-key',
        OMISE_PUBLIC_KEY: 'test-omise-public-key',
      };

      const result = EnvVariables.initialize(config);

      expect(result.API_VERSION).toBe('v2');
    });

    it('should handle complex JWT secrets', () => {
      const config = {
        NODE_ENV: NodeEnv.PRODUCTION,
        PORT: 8080,
        JWT_SECRET:
          'very-long-and-complex-jwt-secret-key-with-special-chars-!@#$%',
        ALLOW_URL: 'https://example.com',
        API_VERSION: 'v1',
        DATABASE_URL: 'postgresql://prod:5432/db',
        SUPABASE_URL: 'https://prod.supabase.co',
        SUPABASE_ANON_KEY: 'prod-anon-key',
        OMISE_SECRET_KEY: 'prod-omise-secret-key',
        OMISE_PUBLIC_KEY: 'prod-omise-public-key',
      };

      const result = EnvVariables.initialize(config);

      expect(result.JWT_SECRET).toBe(
        'very-long-and-complex-jwt-secret-key-with-special-chars-!@#$%',
      );
    });

    it('should handle different frontend URLs', () => {
      const config = {
        NODE_ENV: NodeEnv.PRODUCTION,
        PORT: 8080,
        JWT_SECRET: 'secret',
        ALLOW_URL: 'https://app.example.com',
        API_VERSION: 'v1',
        DATABASE_URL: 'postgresql://prod:5432/db',
        SUPABASE_URL: 'https://prod.supabase.co',
        SUPABASE_ANON_KEY: 'prod-anon-key',
        OMISE_SECRET_KEY: 'prod-omise-secret-key',
        OMISE_PUBLIC_KEY: 'prod-omise-public-key',
      };

      const result = EnvVariables.initialize(config);

      expect(result.ALLOW_URL).toBe('https://app.example.com');
    });
  });

  describe('Singleton Pattern', () => {
    it('should maintain singleton pattern across multiple access points', () => {
      const config = {
        NODE_ENV: NodeEnv.DEVELOPMENT,
        PORT: 3000,
        JWT_SECRET: 'secret',
        ALLOW_URL: 'http://localhost:3000',
        API_VERSION: 'v1',
        DATABASE_URL: 'postgresql://localhost:5432/test',
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_ANON_KEY: 'test-anon-key',
        OMISE_SECRET_KEY: 'test-omise-secret-key',
        OMISE_PUBLIC_KEY: 'test-omise-public-key',
      };

      const init1 = EnvVariables.initialize(config);
      const init2 = EnvVariables.initialize(config);
      const inst1 = EnvVariables.instance;
      const inst2 = EnvVariables.instance;

      expect(init1).toBe(init2);
      expect(init1).toBe(inst1);
      expect(inst1).toBe(inst2);
    });
  });
});
