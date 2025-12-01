/* eslint-disable @typescript-eslint/unbound-method */
import '../../../modules/logger/mocks/logger.mock';
import type {
  AuthOtpResponse,
  SupabaseClient,
  UserResponse,
} from '@supabase/supabase-js';
import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  type MockedObject,
} from 'vitest';

import type { ISupabaseConnector } from '@/infrastructures/supabase/interfaces/supabase-connector.interface';
import { SupabaseManager } from '@/infrastructures/supabase/services/supabase.manager';
import type { AppLoggerService } from '@/modules/logger/services/app-logger.service';

describe('SupabaseManager', () => {
  let manager: SupabaseManager;
  let connectorMock: MockedObject<ISupabaseConnector>;
  let loggerMock: MockedObject<AppLoggerService>;
  let clientMock: MockedObject<SupabaseClient>;

  beforeEach(() => {
    // Setup logger mock
    loggerMock = {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      verbose: vi.fn(),
    } as unknown as MockedObject<AppLoggerService>;

    // Setup client mock
    clientMock = {
      auth: {
        signInWithOtp: vi.fn(),
        verifyOtp: vi.fn(),
        signOut: vi.fn(),
        refreshSession: vi.fn(),
        getUser: vi.fn(),
      },
    } as unknown as MockedObject<SupabaseClient>;

    // Setup connector mock
    connectorMock = {
      getClient: vi.fn().mockReturnValue(clientMock),
      getClientWithAuth: vi.fn().mockReturnValue(clientMock),
    } as unknown as MockedObject<ISupabaseConnector>;

    manager = new SupabaseManager(connectorMock, loggerMock);
  });

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(manager).toBeDefined();
      expect(manager).toBeInstanceOf(SupabaseManager);
    });

    it('should have a static TOKEN symbol', () => {
      expect(SupabaseManager.TOKEN).toBeDefined();
      expect(typeof SupabaseManager.TOKEN).toBe('symbol');
    });
  });

  describe('sendOtp', () => {
    it('should send OTP successfully with email only', async () => {
      const mockResponse: AuthOtpResponse = {
        data: { user: null, session: null },
        error: null,
      };

      vi.mocked(clientMock.auth.signInWithOtp).mockResolvedValue(mockResponse);

      const result = await manager.sendOtp({ email: 'test@example.com' });

      expect(result).toEqual(mockResponse);
      expect(clientMock.auth.signInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: {
          emailRedirectTo: undefined,
          shouldCreateUser: true,
          data: {
            full_name: undefined,
            phone: undefined,
          },
        },
      });
    });

    it('should send OTP with full user data', async () => {
      const mockResponse: AuthOtpResponse = {
        data: { user: null, session: null },
        error: null,
      };

      vi.mocked(clientMock.auth.signInWithOtp).mockResolvedValue(mockResponse);

      await manager.sendOtp({
        email: 'test@example.com',
        fullName: 'John Doe',
        phone: '+1234567890',
      });

      expect(clientMock.auth.signInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: {
          emailRedirectTo: undefined,
          shouldCreateUser: true,
          data: {
            full_name: 'John Doe',
            phone: '+1234567890',
          },
        },
      });
    });

    it('should log debug message', async () => {
      const mockResponse: AuthOtpResponse = {
        data: { user: null, session: null },
        error: null,
      };

      vi.mocked(clientMock.auth.signInWithOtp).mockResolvedValue(mockResponse);

      await manager.sendOtp({ email: 'test@example.com' });

      expect(loggerMock.debug).toHaveBeenCalledWith(
        'Sending OTP to email: test@example.com',
        'SupabaseManager',
      );
    });

    it('should get client from connector', async () => {
      const mockResponse: AuthOtpResponse = {
        data: { user: null, session: null },
        error: null,
      };

      vi.mocked(clientMock.auth.signInWithOtp).mockResolvedValue(mockResponse);

      await manager.sendOtp({ email: 'test@example.com' });

      expect(connectorMock.getClient).toHaveBeenCalled();
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP successfully', async () => {
      const mockResponse = {
        data: {
          user: { id: 'user-123', email: 'test@example.com' },
          session: { access_token: 'token', refresh_token: 'refresh' },
        },
        error: null,
      };

      vi.mocked(clientMock.auth.verifyOtp).mockResolvedValue(
        mockResponse as never,
      );

      const result = await manager.verifyOtp({
        email: 'test@example.com',
        token: '123456',
        type: 'email',
      });

      expect(result).toEqual(mockResponse);
      expect(clientMock.auth.verifyOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        token: '123456',
        type: 'email',
      });
      expect(loggerMock.debug).toHaveBeenCalledWith(
        'Verifying OTP for email: test@example.com',
        'SupabaseManager',
      );
      expect(connectorMock.getClient).toHaveBeenCalled();
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      const mockResponse = { error: null };

      vi.mocked(clientMock.auth.signOut).mockResolvedValue(mockResponse);

      const result = await manager.signOut('test-token');

      expect(result).toEqual(mockResponse);
      expect(clientMock.auth.signOut).toHaveBeenCalled();
      expect(loggerMock.debug).toHaveBeenCalledWith(
        'Signing out user',
        'SupabaseManager',
      );
      expect(connectorMock.getClientWithAuth).toHaveBeenCalledWith(
        'test-token',
      );
    });
  });

  describe('refreshSession', () => {
    it('should refresh session successfully', async () => {
      const mockResponse = {
        data: {
          user: { id: 'user-123' },
          session: {
            access_token: 'new-token',
            refresh_token: 'new-refresh',
          },
        },
        error: null,
      };

      vi.mocked(clientMock.auth.refreshSession).mockResolvedValue(
        mockResponse as never,
      );

      const result = await manager.refreshSession({
        refreshToken: 'old-refresh-token',
      });

      expect(result).toEqual(mockResponse);
      expect(clientMock.auth.refreshSession).toHaveBeenCalledWith({
        refresh_token: 'old-refresh-token',
      });
      expect(loggerMock.debug).toHaveBeenCalledWith(
        'Refreshing session with refresh token',
        'SupabaseManager',
      );
      expect(connectorMock.getClient).toHaveBeenCalled();
    });
  });

  describe('getUserFromToken', () => {
    it('should get user from token successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      };

      const mockResponse: UserResponse = {
        data: { user: mockUser as never },
        error: null,
      };

      vi.mocked(clientMock.auth.getUser).mockResolvedValue(mockResponse);

      const result = await manager.getUserFromToken('test-token');

      expect(result).toEqual(mockResponse);
      expect(result.data.user).toEqual(mockUser);
    });

    it('should log debug message with truncated token', async () => {
      const mockResponse: UserResponse = {
        data: { user: null },
        error: null,
      } as unknown as UserResponse;

      vi.mocked(clientMock.auth.getUser).mockResolvedValue(mockResponse);

      await manager.getUserFromToken('test-access-token-12345');

      expect(loggerMock.debug).toHaveBeenCalledWith(
        'Validating user from token: test-acces...',
        'SupabaseManager',
      );
    });

    it('should get authenticated client from connector', async () => {
      const mockResponse: UserResponse = {
        data: { user: null },
        error: null,
      } as unknown as UserResponse;

      vi.mocked(clientMock.auth.getUser).mockResolvedValue(mockResponse);

      await manager.getUserFromToken('test-token');

      expect(connectorMock.getClientWithAuth).toHaveBeenCalledWith(
        'test-token',
      );
    });

    it('should call getUser on auth client', async () => {
      const mockResponse: UserResponse = {
        data: { user: null },
        error: null,
      } as unknown as UserResponse;

      vi.mocked(clientMock.auth.getUser).mockResolvedValue(mockResponse);

      await manager.getUserFromToken('test-token');

      expect(clientMock.auth.getUser).toHaveBeenCalled();
    });

    it('should handle different token lengths', async () => {
      const mockResponse: UserResponse = {
        data: { user: null },
        error: null,
      } as unknown as UserResponse;

      vi.mocked(clientMock.auth.getUser).mockResolvedValue(mockResponse);

      // Short token
      await manager.getUserFromToken('short');
      expect(loggerMock.debug).toHaveBeenLastCalledWith(
        'Validating user from token: short...',
        'SupabaseManager',
      );

      // Long token
      await manager.getUserFromToken('very-long-token-string-here');
      expect(loggerMock.debug).toHaveBeenLastCalledWith(
        'Validating user from token: very-long-...',
        'SupabaseManager',
      );
    });
  });

  describe('integration', () => {
    it('should handle complete OTP flow', async () => {
      const otpResponse: AuthOtpResponse = {
        data: { user: null, session: null },
        error: null,
      };

      vi.mocked(clientMock.auth.signInWithOtp).mockResolvedValue(otpResponse);

      const result = await manager.sendOtp({
        email: 'user@test.com',
        fullName: 'Test User',
      });

      expect(result.error).toBeNull();
      expect(connectorMock.getClient).toHaveBeenCalled();
      expect(loggerMock.debug).toHaveBeenCalled();
    });

    it('should handle complete authentication flow', async () => {
      const userResponse: UserResponse = {
        data: {
          user: {
            id: 'user-id',
            email: 'test@example.com',
          } as never,
        },
        error: null,
      };

      vi.mocked(clientMock.auth.getUser).mockResolvedValue(userResponse);

      const result = await manager.getUserFromToken('valid-token');

      expect(result.data.user).toBeDefined();
      expect(connectorMock.getClientWithAuth).toHaveBeenCalledWith(
        'valid-token',
      );
      expect(loggerMock.debug).toHaveBeenCalled();
    });
  });
});
