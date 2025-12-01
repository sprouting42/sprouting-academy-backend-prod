import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock SupabaseManager to prevent undefined TOKEN error
vi.mock('@/infrastructures/supabase/services/supabase.manager', () => ({
  SupabaseManager: {
    TOKEN: Symbol('SupabaseManager'),
  },
}));

// Mock AuthRepository to prevent undefined TOKEN error
vi.mock('@/domains/auth/repositories/auth.repository', () => ({
  AuthRepository: {
    TOKEN: Symbol('AuthRepository'),
  },
}));

import type { IAuthRepository } from '@/domains/auth/repositories/interfaces/auth.repository.interface';
import { AuthService } from '@/domains/auth/services/auth.service';
import type { AuthSignInWithOtpInput } from '@/domains/auth/services/dto/auth-sign-in-with-otp.input';
import type { AuthVerifyOtpInput } from '@/domains/auth/services/dto/auth-verify-otp.input';
import { Language } from '@/enums/language.enum';
import type { UserDto } from '@/infrastructures/database/dto/user.dto';
import { UserRole } from '@/infrastructures/database/enums/user-role';
import type { ISupabaseManager } from '@/infrastructures/supabase/interfaces/supabase.service.interface';
import type { AppLoggerService } from '@/modules/logger/services/app-logger.service';

describe('AuthService', () => {
  let authService: AuthService;
  let mockLogger: Partial<AppLoggerService>;
  let mockSupabaseManager: Partial<ISupabaseManager>;
  let mockAuthRepository: Partial<IAuthRepository>;

  const mockUser: UserDto = {
    id: 'user-123',
    email: 'test@example.com',
    fullName: 'Test User',
    phone: '0812345678',
    avatarUrl: undefined,
    role: UserRole.STUDENT,
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  // Helper functions for creating valid Supabase mock objects
  const createMockSupabaseUser = (overrides: Record<string, unknown> = {}) => ({
    id: 'user-123',
    email: 'test@example.com',
    user_metadata: { full_name: 'Test User' },
    app_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    confirmed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    email_confirmed_at: new Date().toISOString(),
    phone: '',
    role: 'authenticated',
    ...overrides,
  });

  const createMockSupabaseSession = (
    overrides: Record<string, unknown> = {},
  ) => {
    const user = createMockSupabaseUser();
    return {
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'bearer' as const,
      user,
      ...overrides,
    };
  };

  const createMockAuthError = (message: string, code = 'auth_error') => ({
    message,
    code,
    status: 400,
    __isAuthError: true,
  });

  beforeEach(() => {
    mockLogger = {
      error: vi.fn(),
      log: vi.fn(),
      warn: vi.fn(),
    };

    mockSupabaseManager = {
      sendOtp: vi.fn(),
      verifyOtp: vi.fn(),
      signOut: vi.fn(),
      refreshSession: vi.fn(),
    };

    mockAuthRepository = {
      findUserById: vi.fn(),
      findUserByEmail: vi.fn(),
      createUser: vi.fn(),
    };

    authService = new AuthService(
      mockLogger as AppLoggerService,
      mockSupabaseManager as ISupabaseManager,
      mockAuthRepository as IAuthRepository,
    );
  });

  describe('signInWithOtp', () => {
    it('should send OTP successfully', async () => {
      const input: AuthSignInWithOtpInput = {
        email: 'test@example.com',
        fullName: 'Test User',
      };

      vi.spyOn(mockSupabaseManager, 'sendOtp').mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      });

      const result = await authService.signInWithOtp(Language.EN, input);

      expect(result.isSuccessful).toBe(true);
      expect(result.responseContent?.email).toBe(input.email);
      expect(result.responseContent?.message).toBe('OTP sent to your email');
      expect(mockSupabaseManager.sendOtp).toHaveBeenCalledWith(input);
    });

    it('should handle sendOtp error with unknown code', async () => {
      const input: AuthSignInWithOtpInput = {
        email: 'test@example.com',
      };

      const error = createMockAuthError(
        'Failed to send OTP',
        'unknown_error_code',
      );
      vi.spyOn(mockSupabaseManager, 'sendOtp').mockResolvedValue({
        data: { user: null, session: null },
        error,
      } as never);

      const result = await authService.signInWithOtp(Language.EN, input);

      expect(result.isSuccessful).toBe(false);
      expect(result.errorMessage).toBeDefined();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle sendOtp with non-Error error object', async () => {
      const input: AuthSignInWithOtpInput = {
        email: 'test@example.com',
      };

      const error = { message: 'Non-Error object', code: 'CUSTOM_ERROR' };
      vi.spyOn(mockSupabaseManager, 'sendOtp').mockResolvedValue({
        data: { user: null, session: null },
        error: error as never,
      } as never);

      const result = await authService.signInWithOtp(Language.EN, input);

      expect(result.isSuccessful).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send OTP'),
        '[object Object]',
      );
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP and create new user successfully', async () => {
      const input: AuthVerifyOtpInput = {
        email: 'new@example.com',
        otp: '123456',
      };

      const supabaseUser = createMockSupabaseUser({
        id: 'supabase-user-123',
        email: input.email,
        user_metadata: { full_name: 'New User' },
      });

      const session = createMockSupabaseSession({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        user: supabaseUser,
      });

      vi.spyOn(mockSupabaseManager, 'verifyOtp').mockResolvedValue({
        data: {
          user: supabaseUser,
          session,
        },
        error: null,
      });

      vi.spyOn(mockAuthRepository, 'findUserByEmail').mockResolvedValue(null);
      vi.spyOn(mockAuthRepository, 'createUser').mockResolvedValue(mockUser);

      const result = await authService.verifyOtp(Language.EN, input);

      expect(result.isSuccessful).toBe(true);
      expect(result.responseContent?.accessToken).toBe('access-token');
      expect(result.responseContent?.refreshToken).toBe('refresh-token');
      expect(mockAuthRepository.createUser).toHaveBeenCalled();
    });

    it('should verify OTP with missing email and user_metadata', async () => {
      const input: AuthVerifyOtpInput = {
        email: 'fallback@example.com',
        otp: '123456',
      };

      const supabaseUser = createMockSupabaseUser({
        id: 'user-fallback-123',
        email: undefined,
        user_metadata: undefined,
        phone: undefined,
      });

      const session = createMockSupabaseSession({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_in: undefined,
        expires_at: undefined,
        user: supabaseUser,
      });

      vi.spyOn(mockSupabaseManager, 'verifyOtp').mockResolvedValue({
        data: {
          user: supabaseUser,
          session,
        },
        error: null,
      });

      vi.spyOn(mockAuthRepository, 'findUserById').mockResolvedValue(null);
      vi.spyOn(mockAuthRepository, 'createUser').mockResolvedValue(mockUser);

      const result = await authService.verifyOtp(Language.EN, input);

      expect(result.isSuccessful).toBe(true);
      expect(mockAuthRepository.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'user-fallback-123',
          email: input.email,
          fullName: 'User',
          phone: undefined,
        }),
      );
    });

    it('should verify OTP and find existing user in database', async () => {
      const input: AuthVerifyOtpInput = {
        email: 'existing@example.com',
        otp: '123456',
      };

      const supabaseUser = createMockSupabaseUser({
        id: mockUser.id,
        email: input.email,
        user_metadata: {
          full_name: 'Existing User',
        },
      });

      const session = createMockSupabaseSession({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        user: supabaseUser,
      });

      vi.spyOn(mockSupabaseManager, 'verifyOtp').mockResolvedValue({
        data: {
          user: supabaseUser,
          session,
        },
        error: null,
      });

      // User already exists in database
      vi.spyOn(mockAuthRepository, 'findUserById').mockResolvedValue(mockUser);

      const result = await authService.verifyOtp(Language.EN, input);

      expect(result.isSuccessful).toBe(true);
      expect(mockAuthRepository.findUserById).toHaveBeenCalledWith(mockUser.id);
      // Should not create new user if already exists
      expect(mockAuthRepository.createUser).not.toHaveBeenCalled();
    });

    it('should handle verifyOtp error', async () => {
      const input: AuthVerifyOtpInput = {
        email: 'test@example.com',
        otp: 'wrong-otp',
      };

      const error = createMockAuthError('Invalid OTP', 'invalid_otp');
      vi.spyOn(mockSupabaseManager, 'verifyOtp').mockResolvedValue({
        data: { user: null, session: null },
        error,
      } as never);

      const result = await authService.verifyOtp(Language.EN, input);

      expect(result.isSuccessful).toBe(false);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle verifyOtp with non-Error error object', async () => {
      const input: AuthVerifyOtpInput = {
        email: 'test@example.com',
        otp: 'wrong-otp',
      };

      const error = { message: 'Plain object error', code: 'PLAIN_ERROR' };
      vi.spyOn(mockSupabaseManager, 'verifyOtp').mockResolvedValue({
        data: { user: null, session: null },
        error: error as never,
      } as never);

      const result = await authService.verifyOtp(Language.EN, input);

      expect(result.isSuccessful).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to verify OTP',
        '[object Object]',
      );
    });

    it('should handle missing session after OTP verification', async () => {
      const input: AuthVerifyOtpInput = {
        email: 'test@example.com',
        otp: '123456',
      };

      const supabaseUser = createMockSupabaseUser({
        id: 'user-123',
        email: input.email,
      });

      vi.spyOn(mockSupabaseManager, 'verifyOtp').mockResolvedValue({
        data: {
          user: supabaseUser,
          session: null,
        },
        error: null,
      });

      const result = await authService.verifyOtp(Language.EN, input);

      expect(result.isSuccessful).toBe(false);
    });
  });

  describe('signOut', () => {
    it('should return error when token is undefined', async () => {
      const result = await authService.signOut(Language.EN, undefined);

      expect(result.isSuccessful).toBe(false);
      expect(result.errorMessage).toContain('token');
      expect(mockSupabaseManager.signOut).not.toHaveBeenCalled();
    });

    it('should return error when token is empty string', async () => {
      const result = await authService.signOut(Language.EN, '');

      expect(result.isSuccessful).toBe(false);
      expect(result.errorMessage).toContain('token');
      expect(mockSupabaseManager.signOut).not.toHaveBeenCalled();
    });

    it('should sign out successfully', async () => {
      const token = 'valid-token';

      vi.spyOn(mockSupabaseManager, 'signOut').mockResolvedValue({
        error: null,
      });

      const result = await authService.signOut(Language.EN, token);

      expect(result.isSuccessful).toBe(true);
      expect(result.responseContent?.message).toBe('Successfully signed out');
      expect(mockSupabaseManager.signOut).toHaveBeenCalledWith(token);
    });

    it('should handle signOut error', async () => {
      const token = 'invalid-token';
      const error = new Error('Invalid token');

      vi.spyOn(mockSupabaseManager, 'signOut').mockResolvedValue({
        error,
      });

      const result = await authService.signOut(Language.EN, token);

      expect(result.isSuccessful).toBe(false);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle signOut with non-Error error object', async () => {
      const token = 'test-token';
      const error = { message: 'Non-Error signout failure' };

      vi.spyOn(mockSupabaseManager, 'signOut').mockResolvedValue({
        error: error as never,
      });

      const result = await authService.signOut(Language.EN, token);

      expect(result.isSuccessful).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to sign out',
        '[object Object]',
      );
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const input = { refreshToken: 'valid-refresh-token' };

      const session = createMockSupabaseSession({
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
      });

      vi.spyOn(mockSupabaseManager, 'refreshSession').mockResolvedValue({
        data: {
          user: session.user,
          session,
        },
        error: null,
      });

      const result = await authService.refreshToken(Language.EN, input);

      expect(result.isSuccessful).toBe(true);
      expect(result.responseContent?.accessToken).toBe('new-access-token');
      expect(result.responseContent?.refreshToken).toBe('new-refresh-token');
    });

    it('should handle refreshToken error', async () => {
      const input = { refreshToken: 'invalid-token' };
      const error = createMockAuthError(
        'Invalid refresh token',
        'invalid_refresh_token',
      );

      vi.spyOn(mockSupabaseManager, 'refreshSession').mockResolvedValue({
        data: { user: null, session: null },
        error,
      } as never);

      const result = await authService.refreshToken(Language.EN, input);

      expect(result.isSuccessful).toBe(false);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle refreshToken with non-Error error object', async () => {
      const input = { refreshToken: 'invalid-token' };
      const error = { message: 'Plain object refresh error' };

      vi.spyOn(mockSupabaseManager, 'refreshSession').mockResolvedValue({
        data: { user: null, session: null },
        error: error as never,
      } as never);

      const result = await authService.refreshToken(Language.EN, input);

      expect(result.isSuccessful).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to refresh token',
        '[object Object]',
      );
    });

    it('should refresh token with missing expiresIn fallback', async () => {
      const input = { refreshToken: 'valid-refresh-token' };

      const session = createMockSupabaseSession({
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: undefined,
      });

      vi.spyOn(mockSupabaseManager, 'refreshSession').mockResolvedValue({
        data: {
          user: session.user,
          session,
        },
        error: null,
      });

      const result = await authService.refreshToken(Language.EN, input);

      expect(result.isSuccessful).toBe(true);
      expect(result.responseContent?.expiresIn).toBe(3600);
    });

    it('should handle missing session in refresh response', async () => {
      const input = { refreshToken: 'valid-token' };

      vi.spyOn(mockSupabaseManager, 'refreshSession').mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      });

      const result = await authService.refreshToken(Language.EN, input);

      expect(result.isSuccessful).toBe(false);
    });
  });

  describe('getUserProfile', () => {
    it('should get user profile successfully', async () => {
      const userId = 'user-123';

      vi.spyOn(mockAuthRepository, 'findUserById').mockResolvedValue(mockUser);

      const result = await authService.getUserProfile(Language.EN, userId);

      expect(result.isSuccessful).toBe(true);
      expect(result.responseContent?.id).toBe(mockUser.id);
      expect(result.responseContent?.email).toBe(mockUser.email);
      expect(mockAuthRepository.findUserById).toHaveBeenCalledWith(userId);
    });

    it('should handle user not found', async () => {
      const userId = 'non-existent';

      vi.spyOn(mockAuthRepository, 'findUserById').mockResolvedValue(null);

      const result = await authService.getUserProfile(Language.EN, userId);

      expect(result.isSuccessful).toBe(false);
      expect(result.errorMessage).toContain('not found');
    });
  });

  describe('TOKEN', () => {
    it('should have a unique TOKEN symbol', () => {
      expect(AuthService.TOKEN).toBeTypeOf('symbol');
      expect(AuthService.TOKEN.toString()).toBe('Symbol(AuthService)');
    });
  });
});
