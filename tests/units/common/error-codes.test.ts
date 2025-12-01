import { HttpStatus } from '@nestjs/common';
import { describe, it, expect } from 'vitest';

import { ErrorCode } from '@/common/errors/types/error-code.type';

describe('ErrorCode', () => {
  describe('create static method', () => {
    it('should create ErrorCode with all properties', () => {
      const errorCode = ErrorCode.create({
        code: 'TEST_ERROR',
        message: 'This is a test error',
        statusCode: HttpStatus.BAD_REQUEST,
      });

      expect(errorCode).toBeInstanceOf(ErrorCode);
      expect(errorCode.code).toBe('TEST_ERROR');
      expect(errorCode.message).toBe('This is a test error');
      expect(errorCode.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should create ErrorCode with minimal data', () => {
      const errorCode = ErrorCode.create({
        code: 'MINIMAL_ERROR',
        message: 'Minimal error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });

      expect(errorCode.code).toBe('MINIMAL_ERROR');
      expect(errorCode.message).toBe('Minimal error');
      expect(errorCode.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should create ErrorCode with 404 status', () => {
      const errorCode = ErrorCode.create({
        code: 'NOT_FOUND',
        message: 'Resource not found',
        statusCode: HttpStatus.NOT_FOUND,
      });

      expect(errorCode.statusCode).toBe(404);
      expect(errorCode.code).toBe('NOT_FOUND');
    });

    it('should create ErrorCode with 401 status', () => {
      const errorCode = ErrorCode.create({
        code: 'UNAUTHORIZED',
        message: 'Unauthorized access',
        statusCode: HttpStatus.UNAUTHORIZED,
      });

      expect(errorCode.statusCode).toBe(401);
      expect(errorCode.message).toBe('Unauthorized access');
    });

    it('should create ErrorCode with 403 status', () => {
      const errorCode = ErrorCode.create({
        code: 'FORBIDDEN',
        message: 'Access forbidden',
        statusCode: HttpStatus.FORBIDDEN,
      });

      expect(errorCode.statusCode).toBe(403);
    });

    it('should create ErrorCode with 409 status', () => {
      const errorCode = ErrorCode.create({
        code: 'CONFLICT',
        message: 'Resource already exists',
        statusCode: HttpStatus.CONFLICT,
      });

      expect(errorCode.statusCode).toBe(409);
    });
  });

  describe('Error Code Properties', () => {
    it('should preserve code property', () => {
      const errorCode = ErrorCode.create({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        statusCode: HttpStatus.BAD_REQUEST,
      });

      expect(errorCode).toHaveProperty('code');
      expect(typeof errorCode.code).toBe('string');
    });

    it('should preserve message property', () => {
      const errorCode = ErrorCode.create({
        code: 'TEST_ERROR',
        message: 'Test error message',
        statusCode: HttpStatus.BAD_REQUEST,
      });

      expect(errorCode).toHaveProperty('message');
      expect(typeof errorCode.message).toBe('string');
    });

    it('should preserve statusCode property', () => {
      const errorCode = ErrorCode.create({
        code: 'TEST_ERROR',
        message: 'Test error',
        statusCode: HttpStatus.BAD_REQUEST,
      });

      expect(errorCode).toHaveProperty('statusCode');
      expect(typeof errorCode.statusCode).toBe('number');
    });
  });

  describe('Common Error Scenarios', () => {
    it('should create validation error code', () => {
      const validationError = ErrorCode.create({
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        statusCode: HttpStatus.BAD_REQUEST,
      });

      expect(validationError.code).toBe('VALIDATION_ERROR');
      expect(validationError.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should create user not found error code', () => {
      const notFoundError = ErrorCode.create({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        statusCode: HttpStatus.NOT_FOUND,
      });

      expect(notFoundError.code).toBe('USER_NOT_FOUND');
      expect(notFoundError.message).toBe('User not found');
    });

    it('should create unauthorized error code', () => {
      const unauthorizedError = ErrorCode.create({
        code: 'UNAUTHORIZED_ACCESS',
        message: 'Unauthorized access',
        statusCode: HttpStatus.UNAUTHORIZED,
      });

      expect(unauthorizedError.code).toBe('UNAUTHORIZED_ACCESS');
      expect(unauthorizedError.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should create internal server error code', () => {
      const serverError = ErrorCode.create({
        code: 'INTERNAL_ERROR',
        message: 'Internal server error occurred',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });

      expect(serverError.code).toBe('INTERNAL_ERROR');
      expect(serverError.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should create duplicate resource error code', () => {
      const duplicateError = ErrorCode.create({
        code: 'DUPLICATE_RESOURCE',
        message: 'Resource already exists',
        statusCode: HttpStatus.CONFLICT,
      });

      expect(duplicateError.code).toBe('DUPLICATE_RESOURCE');
      expect(duplicateError.statusCode).toBe(HttpStatus.CONFLICT);
    });

    it('should create forbidden access error code', () => {
      const forbiddenError = ErrorCode.create({
        code: 'FORBIDDEN_ACCESS',
        message: 'You do not have permission to access this resource',
        statusCode: HttpStatus.FORBIDDEN,
      });

      expect(forbiddenError.code).toBe('FORBIDDEN_ACCESS');
      expect(forbiddenError.statusCode).toBe(HttpStatus.FORBIDDEN);
    });
  });

  describe('Error Code with Various Messages', () => {
    it('should handle short error messages', () => {
      const errorCode = ErrorCode.create({
        code: 'ERROR',
        message: 'Error',
        statusCode: HttpStatus.BAD_REQUEST,
      });

      expect(errorCode.message).toBe('Error');
    });

    it('should handle long error messages', () => {
      const longMessage =
        'This is a very long error message that describes in detail what went wrong with the request and provides helpful information for debugging';

      const errorCode = ErrorCode.create({
        code: 'LONG_ERROR',
        message: longMessage,
        statusCode: HttpStatus.BAD_REQUEST,
      });

      expect(errorCode.message).toBe(longMessage);
    });

    it('should handle error messages with special characters', () => {
      const message = "User's email couldn't be validated: invalid format!";

      const errorCode = ErrorCode.create({
        code: 'EMAIL_VALIDATION_ERROR',
        message,
        statusCode: HttpStatus.BAD_REQUEST,
      });

      expect(errorCode.message).toBe(message);
    });
  });

  describe('Error Code Formatting', () => {
    it('should handle snake_case code format', () => {
      const errorCode = ErrorCode.create({
        code: 'user_not_found',
        message: 'User not found',
        statusCode: HttpStatus.NOT_FOUND,
      });

      expect(errorCode.code).toBe('user_not_found');
    });

    it('should handle UPPER_CASE code format', () => {
      const errorCode = ErrorCode.create({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        statusCode: HttpStatus.NOT_FOUND,
      });

      expect(errorCode.code).toBe('USER_NOT_FOUND');
    });

    it('should handle dot notation code format', () => {
      const errorCode = ErrorCode.create({
        code: 'USER.NOT_FOUND',
        message: 'User not found',
        statusCode: HttpStatus.NOT_FOUND,
      });

      expect(errorCode.code).toBe('USER.NOT_FOUND');
    });

    it('should handle nested dot notation code format', () => {
      const errorCode = ErrorCode.create({
        code: 'SERVICE_INTEREST.NAME_ALREADY_EXISTS',
        message: 'Service interest name already exists',
        statusCode: HttpStatus.CONFLICT,
      });

      expect(errorCode.code).toBe('SERVICE_INTEREST.NAME_ALREADY_EXISTS');
    });
  });

  describe('Multiple Error Codes Creation', () => {
    it('should create multiple different error codes', () => {
      const error1 = ErrorCode.create({
        code: 'ERROR_1',
        message: 'Error 1',
        statusCode: HttpStatus.BAD_REQUEST,
      });
      const error2 = ErrorCode.create({
        code: 'ERROR_2',
        message: 'Error 2',
        statusCode: HttpStatus.NOT_FOUND,
      });
      const error3 = ErrorCode.create({
        code: 'ERROR_3',
        message: 'Error 3',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });

      expect(error1.code).toBe('ERROR_1');
      expect(error2.code).toBe('ERROR_2');
      expect(error3.code).toBe('ERROR_3');
      expect(error1.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(error2.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(error3.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should create error codes with same status but different codes', () => {
      const error1 = ErrorCode.create({
        code: 'INVALID_EMAIL',
        message: 'Invalid email format',
        statusCode: HttpStatus.BAD_REQUEST,
      });

      const error2 = ErrorCode.create({
        code: 'INVALID_PASSWORD',
        message: 'Invalid password format',
        statusCode: HttpStatus.BAD_REQUEST,
      });

      expect(error1.statusCode).toBe(error2.statusCode);
      expect(error1.code).not.toBe(error2.code);
    });
  });

  describe('Real-world Service Interest Error Codes', () => {
    it('should create SERVICE_INTEREST.NOT_FOUND error code', () => {
      const errorCode = ErrorCode.create({
        code: 'SERVICE_INTEREST.NOT_FOUND',
        message: 'Service interest not found.',
        statusCode: HttpStatus.NOT_FOUND,
      });

      expect(errorCode.code).toBe('SERVICE_INTEREST.NOT_FOUND');
      expect(errorCode.message).toBe('Service interest not found.');
      expect(errorCode.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('should create SERVICE_INTEREST.NAME_ALREADY_EXISTS error code', () => {
      const errorCode = ErrorCode.create({
        code: 'SERVICE_INTEREST.NAME_ALREADY_EXISTS',
        message: 'Service interest name already exists.',
        statusCode: HttpStatus.CONFLICT,
      });

      expect(errorCode.code).toBe('SERVICE_INTEREST.NAME_ALREADY_EXISTS');
      expect(errorCode.message).toBe('Service interest name already exists.');
      expect(errorCode.statusCode).toBe(HttpStatus.CONFLICT);
    });
  });

  describe('Immutability', () => {
    it('should create separate instances for each call', () => {
      const error1 = ErrorCode.create({
        code: 'TEST_ERROR',
        message: 'Test error',
        statusCode: HttpStatus.BAD_REQUEST,
      });

      const error2 = ErrorCode.create({
        code: 'TEST_ERROR',
        message: 'Test error',
        statusCode: HttpStatus.BAD_REQUEST,
      });

      expect(error1).not.toBe(error2);
      expect(error1.code).toBe(error2.code);
    });
  });
});
