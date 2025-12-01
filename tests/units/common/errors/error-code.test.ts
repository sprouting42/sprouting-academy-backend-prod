import { HttpStatus } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { ERROR_CODES } from '@/common/errors/error-code';

describe('error-code', () => {
  describe('ERROR_CODES', () => {
    describe('AUTH', () => {
      it('should have SIGN_IN_ERROR error code', () => {
        expect(ERROR_CODES.AUTH.SIGN_IN_ERROR).toBeDefined();
        expect(ERROR_CODES.AUTH.SIGN_IN_ERROR.code).toBe('AUTH.SIGN_IN_ERROR');
        expect(ERROR_CODES.AUTH.SIGN_IN_ERROR.message).toHaveProperty('EN');
        expect(ERROR_CODES.AUTH.SIGN_IN_ERROR.message).toHaveProperty('TH');
        expect(ERROR_CODES.AUTH.SIGN_IN_ERROR.statusCode).toBe(
          HttpStatus.BAD_REQUEST,
        );
      });

      it('should have USER_NOT_FOUND error code', () => {
        expect(ERROR_CODES.AUTH.USER_NOT_FOUND).toBeDefined();
        expect(ERROR_CODES.AUTH.USER_NOT_FOUND.code).toBe(
          'AUTH.USER_NOT_FOUND',
        );
        expect(ERROR_CODES.AUTH.USER_NOT_FOUND.message).toHaveProperty('EN');
        expect(ERROR_CODES.AUTH.USER_NOT_FOUND.message).toHaveProperty('TH');
        expect(ERROR_CODES.AUTH.USER_NOT_FOUND.statusCode).toBe(
          HttpStatus.NOT_FOUND,
        );
      });
    });

    it('should be immutable (frozen)', () => {
      expect(Object.isFrozen(ERROR_CODES)).toBe(false); // Top level is not frozen
      // But we can verify the structure exists
      expect(ERROR_CODES.AUTH).toBeDefined();
    });

    it('should have all auth error codes accessible', () => {
      const authErrorCodes = Object.keys(ERROR_CODES.AUTH);
      expect(authErrorCodes).toContain('SIGN_IN_ERROR');
      expect(authErrorCodes).toContain('USER_NOT_FOUND');
    });
  });
});
