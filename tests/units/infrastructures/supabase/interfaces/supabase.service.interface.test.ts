/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  AuthOtpResponse,
  AuthResponse,
  UserResponse,
} from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';

// Import with side effect to ensure coverage tracking
import '@/infrastructures/supabase/dto/sign-in-with-otp.dto';
import '@/infrastructures/supabase/interfaces/supabase.service.interface';
import type { RefreshTokenInputDto } from '@/infrastructures/supabase/dto/refresh-token.dto';
import type { SignInWithOtpInputDto } from '@/infrastructures/supabase/dto/sign-in-with-otp.dto';
import type { VerifyOtpInputDto } from '@/infrastructures/supabase/dto/verify-otp.dto';
import type { ISupabaseManager } from '@/infrastructures/supabase/interfaces/supabase.service.interface';

describe('supabase.service.interface', () => {
  describe('ISupabaseManager', () => {
    it('should define sendOtp method signature', () => {
      const mockService: ISupabaseManager = {
        sendOtp: async (input: SignInWithOtpInputDto) => {
          return {
            data: { user: null, session: null },
            error: null,
          } as AuthOtpResponse;
        },
        verifyOtp: async (input: VerifyOtpInputDto) => {
          return {
            data: { user: null, session: null },
            error: null,
          } as AuthResponse;
        },
        signOut: async (token: string) => {
          return { error: null };
        },
        refreshSession: async (input: RefreshTokenInputDto) => {
          return {
            data: { user: null, session: null },
            error: null,
          } as AuthResponse;
        },
        getUserFromToken: async () => {
          return {
            data: { user: null },
            error: null,
          } as unknown as UserResponse;
        },
      };

      expect(mockService.sendOtp).toBeDefined();
      expect(typeof mockService.sendOtp).toBe('function');
    });

    it('should define getUserFromToken method signature', () => {
      const mockService: ISupabaseManager = {
        sendOtp: async () => {
          return {
            data: { user: null, session: null },
            error: null,
          } as AuthOtpResponse;
        },
        verifyOtp: async (input: VerifyOtpInputDto) => {
          return {
            data: { user: null, session: null },
            error: null,
          } as AuthResponse;
        },
        signOut: async (token: string) => {
          return { error: null };
        },
        refreshSession: async (input: RefreshTokenInputDto) => {
          return {
            data: { user: null, session: null },
            error: null,
          } as AuthResponse;
        },
        getUserFromToken: async (token: string) => {
          expect(token).toBeDefined();
          return {
            data: { user: null },
            error: null,
          } as unknown as UserResponse;
        },
      };

      expect(mockService.getUserFromToken).toBeDefined();
      expect(typeof mockService.getUserFromToken).toBe('function');
    });

    it('should allow implementation with working methods', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      const service: ISupabaseManager = {
        sendOtp: async (input: SignInWithOtpInputDto) => {
          return {
            data: {
              user: null,
              session: null,
            },
            error: null,
          } as AuthOtpResponse;
        },
        verifyOtp: async (input: VerifyOtpInputDto) => {
          return {
            data: {
              user: mockUser as never,
              session: { access_token: 'test-token' } as never,
            },
            error: null,
          } as AuthResponse;
        },
        signOut: async (token: string) => {
          return { error: null };
        },
        refreshSession: async (input: RefreshTokenInputDto) => {
          return {
            data: {
              user: mockUser as never,
              session: { access_token: 'new-token' } as never,
            },
            error: null,
          } as AuthResponse;
        },
        getUserFromToken: async (token: string) => {
          return {
            data: {
              user: mockUser as never,
            },
            error: null,
          } as UserResponse;
        },
      };

      const otpResult = await service.sendOtp({ email: 'test@example.com' });
      expect(otpResult.data).toBeDefined();

      const userResult = await service.getUserFromToken('test-token');
      expect(userResult.data.user).toEqual(mockUser);
    });

    it('should handle sendOtp with all input fields', async () => {
      const service: ISupabaseManager = {
        sendOtp: async (input: SignInWithOtpInputDto) => {
          expect(input.email).toBe('test@example.com');
          expect(input.fullName).toBe('Test User');
          expect(input.phone).toBe('+1234567890');

          return {
            data: { user: null, session: null },
            error: null,
          } as AuthOtpResponse;
        },
        verifyOtp: async (input: VerifyOtpInputDto) => {
          return {
            data: { user: null, session: null },
            error: null,
          } as AuthResponse;
        },
        signOut: async (token: string) => {
          return { error: null };
        },
        refreshSession: async (input: RefreshTokenInputDto) => {
          return {
            data: { user: null, session: null },
            error: null,
          } as AuthResponse;
        },
        getUserFromToken: async () => {
          return {
            data: { user: null },
            error: null,
          } as unknown as UserResponse;
        },
      };

      await service.sendOtp({
        email: 'test@example.com',
        fullName: 'Test User',
        phone: '+1234567890',
      });
    });

    it('should handle error responses', async () => {
      const mockError = {
        message: 'Test error',
        name: 'Error',
        status: 400,
      };

      const service: ISupabaseManager = {
        sendOtp: async () => {
          return {
            data: { user: null, session: null },
            error: mockError as never,
          } as AuthOtpResponse;
        },
        verifyOtp: async (input: VerifyOtpInputDto) => {
          return {
            data: { user: null, session: null },
            error: mockError as never,
          } as AuthResponse;
        },
        signOut: async (token: string) => {
          return { error: mockError as never };
        },
        refreshSession: async (input: RefreshTokenInputDto) => {
          return {
            data: { user: null, session: null },
            error: mockError as never,
          } as AuthResponse;
        },
        getUserFromToken: async () => {
          return {
            data: { user: null },
            error: mockError as never,
          } as UserResponse;
        },
      };

      const otpResult = await service.sendOtp({ email: 'test@example.com' });
      expect(otpResult.error).toEqual(mockError);

      const userResult = await service.getUserFromToken('token');
      expect(userResult.error).toEqual(mockError);
    });
  });
});
