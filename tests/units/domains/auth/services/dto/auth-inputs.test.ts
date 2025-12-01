import { describe, expect, it } from 'vitest';

import type { AuthRefreshTokenInput } from '@/domains/auth/services/dto/auth-refresh-token.input';
import type { AuthSignInWithOtpInput } from '@/domains/auth/services/dto/auth-sign-in-with-otp.input';
import type { AuthVerifyOtpInput } from '@/domains/auth/services/dto/auth-verify-otp.input';

describe('Auth Input DTOs', () => {
  describe('AuthSignInWithOtpInput', () => {
    it('should accept email only', () => {
      const input: AuthSignInWithOtpInput = {
        email: 'test@example.com',
      };

      expect(input.email).toBe('test@example.com');
      expect(input.fullName).toBeUndefined();
      expect(input.phone).toBeUndefined();
    });

    it('should accept email with fullName', () => {
      const input: AuthSignInWithOtpInput = {
        email: 'test@example.com',
        fullName: 'Test User',
      };

      expect(input.email).toBe('test@example.com');
      expect(input.fullName).toBe('Test User');
    });

    it('should accept email with phone', () => {
      const input: AuthSignInWithOtpInput = {
        email: 'test@example.com',
        phone: '0812345678',
      };

      expect(input.email).toBe('test@example.com');
      expect(input.phone).toBe('0812345678');
    });

    it('should accept all fields', () => {
      const input: AuthSignInWithOtpInput = {
        email: 'test@example.com',
        fullName: 'Test User',
        phone: '0812345678',
      };

      expect(input.email).toBe('test@example.com');
      expect(input.fullName).toBe('Test User');
      expect(input.phone).toBe('0812345678');
    });
  });

  describe('AuthVerifyOtpInput', () => {
    it('should accept email and otp', () => {
      const input: AuthVerifyOtpInput = {
        email: 'test@example.com',
        otp: '123456',
      };

      expect(input.email).toBe('test@example.com');
      expect(input.otp).toBe('123456');
    });

    it('should work with 6-digit otp', () => {
      const input: AuthVerifyOtpInput = {
        email: 'user@example.com',
        otp: '654321',
      };

      expect(input.otp).toBe('654321');
      expect(input.otp).toHaveLength(6);
    });
  });

  describe('AuthRefreshTokenInput', () => {
    it('should accept refresh token', () => {
      const input: AuthRefreshTokenInput = {
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      };

      expect(input.refreshToken).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    });

    it('should accept any string as refresh token', () => {
      const input: AuthRefreshTokenInput = {
        refreshToken: 'mock-refresh-token-12345',
      };

      expect(input.refreshToken).toBeDefined();
      expect(typeof input.refreshToken).toBe('string');
    });
  });
});
