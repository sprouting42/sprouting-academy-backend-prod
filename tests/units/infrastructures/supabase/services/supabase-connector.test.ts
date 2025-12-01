/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/only-throw-error */

import '../../../modules/logger/mocks/logger.mock.ts';
import { InternalServerErrorException } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  type MockedObject,
} from 'vitest';

import { SupabaseConnector } from '@/infrastructures/supabase/services/supabase-connector';
import { EnvVariables } from '@/modules/config/dto/config.dto';
import type { AppLoggerService } from '@/modules/logger/services/app-logger.service';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

// Mock EnvVariables
vi.mock('@/modules/config/dto/config.dto', () => ({
  EnvVariables: {
    instance: {
      SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_ANON_KEY: 'test-anon-key',
    },
  },
}));

describe('SupabaseConnector', () => {
  let connector: SupabaseConnector;
  let loggerMock: MockedObject<AppLoggerService>;
  let mockClient: SupabaseClient;

  beforeEach(async () => {
    // Setup logger mock
    loggerMock = {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      verbose: vi.fn(),
    } as unknown as MockedObject<AppLoggerService>;

    // Setup mock Supabase client
    mockClient = {
      auth: {
        getUser: vi.fn(),
        signInWithOtp: vi.fn(),
      },
    } as unknown as SupabaseClient;

    // Mock createClient
    const { createClient } = await import('@supabase/supabase-js');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    vi.mocked(createClient).mockReturnValue(mockClient as any);

    connector = new SupabaseConnector(loggerMock);
  });

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(connector).toBeDefined();
      expect(connector).toBeInstanceOf(SupabaseConnector);
    });

    it('should have a static TOKEN symbol', () => {
      expect(SupabaseConnector.TOKEN).toBeDefined();
      expect(typeof SupabaseConnector.TOKEN).toBe('symbol');
    });
  });

  describe('onModuleInit', () => {
    it('should initialize client successfully', () => {
      connector.onModuleInit();

      expect(loggerMock.log).toHaveBeenCalledWith(
        'Supabase client initialized successfully',
        'SupabaseConnector',
      );
    });

    it('should log error if initialization fails', () => {
      const originalUrl = EnvVariables.instance.SUPABASE_URL;
      (
        EnvVariables.instance as { SUPABASE_URL: string | undefined }
      ).SUPABASE_URL = undefined;

      expect(() => connector.onModuleInit()).toThrow();
      expect(loggerMock.error).toHaveBeenCalled();

      (EnvVariables.instance as { SUPABASE_URL: string }).SUPABASE_URL =
        originalUrl;
    });

    it('should handle non-Error exceptions during initialization', async () => {
      const originalUrl = EnvVariables.instance.SUPABASE_URL;
      (
        EnvVariables.instance as { SUPABASE_URL: string | undefined }
      ).SUPABASE_URL = '';

      const connector2 = new SupabaseConnector(loggerMock);

      expect(() => connector2.onModuleInit()).toThrow();

      (EnvVariables.instance as { SUPABASE_URL: string }).SUPABASE_URL =
        originalUrl;
    });

    it('should handle non-Error type exceptions with undefined stack', () => {
      const connector2 = new SupabaseConnector(loggerMock);
      // Spy on the private initializeClient method
      const initSpy = vi.spyOn(connector2 as any, 'initializeClient');
      initSpy.mockImplementationOnce(() => {
        throw 'String error without Error object';
      });

      expect(() => connector2.onModuleInit()).toThrow();

      expect(loggerMock.error).toHaveBeenCalledWith(
        'Failed to initialize Supabase client: Unknown error',
        undefined,
        'SupabaseConnector',
      );

      initSpy.mockRestore();
    });
  });

  describe('getClient', () => {
    it('should return the initialized client', () => {
      connector.onModuleInit();
      const client = connector.getClient();

      expect(client).toBe(mockClient);
    });

    it('should throw InternalServerErrorException if client not initialized', () => {
      expect(() => connector.getClient()).toThrow(InternalServerErrorException);
      expect(() => connector.getClient()).toThrow(
        'Supabase client not initialized',
      );
    });

    it('should log error when client is not initialized', () => {
      try {
        connector.getClient();
      } catch {
        // Expected to throw
      }

      expect(loggerMock.error).toHaveBeenCalledWith(
        'Supabase client not initialized',
        undefined,
        'SupabaseConnector',
      );
    });

    it('should not throw after successful initialization', () => {
      connector.onModuleInit();
      expect(() => connector.getClient()).not.toThrow();
    });
  });

  describe('getClientWithAuth', () => {
    beforeEach(() => {
      connector.onModuleInit();
    });

    it('should create authenticated client with access token', async () => {
      const token = 'test-access-token';
      const { createClient } = await import('@supabase/supabase-js');

      connector.getClientWithAuth(token);

      expect(createClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        expect.objectContaining({
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }),
      );
      expect(loggerMock.debug).toHaveBeenCalledWith(
        'Creating authenticated Supabase client',
        'SupabaseConnector',
      );
    });

    it('should throw error if access token is empty', () => {
      expect(() => connector.getClientWithAuth('')).toThrow(
        InternalServerErrorException,
      );
      expect(() => connector.getClientWithAuth('')).toThrow(
        'Access token must be provided',
      );
    });

    it('should throw error if access token is whitespace', () => {
      expect(() => connector.getClientWithAuth('   ')).toThrow(
        InternalServerErrorException,
      );
    });

    it('should warn when invalid token provided', () => {
      try {
        connector.getClientWithAuth('');
      } catch {
        // Expected to throw
      }

      expect(loggerMock.warn).toHaveBeenCalledWith(
        'Access token must be provided',
        'SupabaseConnector',
      );
    });

    it('should handle createClient error', async () => {
      const { createClient } = await import('@supabase/supabase-js');
      const error = new Error('Client creation failed');

      vi.mocked(createClient).mockImplementationOnce(() => {
        throw error;
      });

      expect(() => connector.getClientWithAuth('valid-token')).toThrow(
        InternalServerErrorException,
      );

      expect(loggerMock.error).toHaveBeenCalledWith(
        'Failed to create authenticated client: Client creation failed',
        expect.any(String),
        'SupabaseConnector',
      );
    });

    it('should handle non-Error exceptions', async () => {
      const { createClient } = await import('@supabase/supabase-js');

      vi.mocked(createClient).mockImplementationOnce(() => {
        throw 'String error';
      });

      expect(() => connector.getClientWithAuth('valid-token')).toThrow(
        InternalServerErrorException,
      );

      expect(loggerMock.error).toHaveBeenCalledWith(
        'Failed to create authenticated client: Unknown error',
        undefined,
        'SupabaseConnector',
      );
    });
  });

  describe('credentials validation', () => {
    it('should throw error if SUPABASE_URL is missing', () => {
      const originalUrl = EnvVariables.instance.SUPABASE_URL;
      (
        EnvVariables.instance as { SUPABASE_URL: string | undefined }
      ).SUPABASE_URL = undefined;

      const newConnector = new SupabaseConnector(loggerMock);

      expect(() => newConnector.onModuleInit()).toThrow(
        'SUPABASE_URL environment variable is required',
      );

      (EnvVariables.instance as { SUPABASE_URL: string }).SUPABASE_URL =
        originalUrl;
    });

    it('should throw error if SUPABASE_URL is empty string', () => {
      const originalUrl = EnvVariables.instance.SUPABASE_URL;
      (EnvVariables.instance as { SUPABASE_URL: string }).SUPABASE_URL = '';

      const newConnector = new SupabaseConnector(loggerMock);

      expect(() => newConnector.onModuleInit()).toThrow(
        'SUPABASE_URL environment variable is required',
      );

      (EnvVariables.instance as { SUPABASE_URL: string }).SUPABASE_URL =
        originalUrl;
    });

    it('should throw error if SUPABASE_URL is whitespace', () => {
      const originalUrl = EnvVariables.instance.SUPABASE_URL;
      (EnvVariables.instance as { SUPABASE_URL: string }).SUPABASE_URL = '   ';

      const newConnector = new SupabaseConnector(loggerMock);

      expect(() => newConnector.onModuleInit()).toThrow(
        'SUPABASE_URL environment variable is required',
      );

      (EnvVariables.instance as { SUPABASE_URL: string }).SUPABASE_URL =
        originalUrl;
    });

    it('should throw error if SUPABASE_ANON_KEY is missing', () => {
      const originalKey = EnvVariables.instance.SUPABASE_ANON_KEY;
      (
        EnvVariables.instance as { SUPABASE_ANON_KEY: string | undefined }
      ).SUPABASE_ANON_KEY = undefined;

      const newConnector = new SupabaseConnector(loggerMock);

      expect(() => newConnector.onModuleInit()).toThrow(
        'SUPABASE_ANON_KEY environment variable is required',
      );

      (
        EnvVariables.instance as { SUPABASE_ANON_KEY: string }
      ).SUPABASE_ANON_KEY = originalKey;
    });

    it('should throw error if SUPABASE_ANON_KEY is empty string', () => {
      const originalKey = EnvVariables.instance.SUPABASE_ANON_KEY;
      (
        EnvVariables.instance as { SUPABASE_ANON_KEY: string }
      ).SUPABASE_ANON_KEY = '';

      const newConnector = new SupabaseConnector(loggerMock);

      expect(() => newConnector.onModuleInit()).toThrow(
        'SUPABASE_ANON_KEY environment variable is required',
      );

      (
        EnvVariables.instance as { SUPABASE_ANON_KEY: string }
      ).SUPABASE_ANON_KEY = originalKey;
    });
  });

  describe('auth config', () => {
    it('should initialize with AUTH_CONFIG', async () => {
      const { createClient } = await import('@supabase/supabase-js');

      connector.onModuleInit();

      expect(createClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        expect.objectContaining({
          auth: expect.any(Object),
        }),
      );
    });

    it('should use AUTH_CONFIG_WITHOUT_REFRESH for authenticated clients', async () => {
      connector.onModuleInit();

      const { createClient } = await import('@supabase/supabase-js');

      connector.getClientWithAuth('test-token');

      const lastCall =
        vi.mocked(createClient).mock.calls[
          vi.mocked(createClient).mock.calls.length - 1
        ];

      expect(lastCall?.[2]).toHaveProperty('auth');
    });
  });
});
