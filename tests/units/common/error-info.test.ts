import { describe, expect, it } from 'vitest';

import { ErrorDebug, ErrorDetail } from '@/common/errors/error-info';

describe('ErrorDetail', () => {
  describe('constructor', () => {
    it('should create an instance', () => {
      const error = new ErrorDetail();

      expect(error).toBeInstanceOf(ErrorDetail);
    });

    it('should allow setting message', () => {
      const error = new ErrorDetail();
      error.message = 'Test error message';

      expect(error.message).toBe('Test error message');
    });

    it('should allow setting optional code', () => {
      const error = new ErrorDetail();
      error.code = 'VALIDATION_ERROR';

      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('should allow setting optional validationErrors', () => {
      const error = new ErrorDetail();
      error.validationErrors = { email: ['Invalid email format'] };

      expect(error.validationErrors).toEqual({
        email: ['Invalid email format'],
      });
    });
  });

  describe('properties', () => {
    it('should have message property', () => {
      const error = new ErrorDetail();
      error.message = 'Error';

      expect('message' in error).toBe(true);
      expect(error.message).toBeDefined();
    });

    it('should have optional code property', () => {
      const error = new ErrorDetail();

      expect('code' in error).toBe(true);
    });

    it('should have optional validationErrors property', () => {
      const error = new ErrorDetail();

      expect('validationErrors' in error).toBe(true);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle simple error message', () => {
      const error = new ErrorDetail();
      error.message = 'Resource not found';

      expect(error.message).toBe('Resource not found');
      expect(error.code).toBeUndefined();
      expect(error.validationErrors).toBeUndefined();
    });

    it('should handle error with code', () => {
      const error = new ErrorDetail();
      error.message = 'Resource not found';
      error.code = 'RESOURCE_NOT_FOUND';

      expect(error.message).toBe('Resource not found');
      expect(error.code).toBe('RESOURCE_NOT_FOUND');
    });

    it('should handle validation error with multiple fields', () => {
      const error = new ErrorDetail();
      error.message = 'Validation failed';
      error.code = 'VALIDATION_ERROR';
      error.validationErrors = {
        email: ['Email is required', 'Email format is invalid'],
        password: ['Password must be at least 8 characters'],
        age: ['Age must be a number'],
      };

      expect(error.message).toBe('Validation failed');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.validationErrors).toHaveProperty('email');
      expect(error.validationErrors).toHaveProperty('password');
      expect(error.validationErrors).toHaveProperty('age');
      expect(error.validationErrors?.email).toHaveLength(2);
    });

    it('should handle empty validation errors object', () => {
      const error = new ErrorDetail();
      error.message = 'Validation failed';
      error.validationErrors = {};

      expect(error.validationErrors).toEqual({});
    });
  });
});

describe('ErrorDebug', () => {
  describe('constructor', () => {
    it('should create an instance', () => {
      const error = new ErrorDebug();

      expect(error).toBeInstanceOf(ErrorDebug);
      expect(error).toBeInstanceOf(ErrorDetail);
    });

    it('should inherit ErrorDetail properties', () => {
      const error = new ErrorDebug();
      error.message = 'Debug error';
      error.code = 'DEBUG_ERROR';

      expect(error.message).toBe('Debug error');
      expect(error.code).toBe('DEBUG_ERROR');
    });

    it('should allow setting debugSource', () => {
      const error = new ErrorDebug();
      error.debugSource = 'UserService.createUser';

      expect(error.debugSource).toBe('UserService.createUser');
    });

    it('should allow setting debugInfo', () => {
      const error = new ErrorDebug();
      error.debugInfo = 'Stack trace information';

      expect(error.debugInfo).toBe('Stack trace information');
    });
  });

  describe('properties', () => {
    it('should have all ErrorDetail properties', () => {
      const error = new ErrorDebug();

      expect('message' in error).toBe(true);
      expect('code' in error).toBe(true);
      expect('validationErrors' in error).toBe(true);
    });

    it('should have debugSource property', () => {
      const error = new ErrorDebug();

      expect('debugSource' in error).toBe(true);
    });

    it('should have debugInfo property', () => {
      const error = new ErrorDebug();

      expect('debugInfo' in error).toBe(true);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle development error with debug info', () => {
      const error = new ErrorDebug();
      error.message = 'Database connection failed';
      error.code = 'DB_CONNECTION_ERROR';
      error.debugSource = 'DatabaseService.connect';
      error.debugInfo = 'Connection timeout after 5000ms';

      expect(error.message).toBe('Database connection failed');
      expect(error.code).toBe('DB_CONNECTION_ERROR');
      expect(error.debugSource).toBe('DatabaseService.connect');
      expect(error.debugInfo).toBe('Connection timeout after 5000ms');
    });

    it('should handle validation error with debug info', () => {
      const error = new ErrorDebug();
      error.message = 'Validation failed';
      error.code = 'VALIDATION_ERROR';
      error.validationErrors = {
        email: ['Invalid format'],
      };
      error.debugSource = 'UserController.create';
      error.debugInfo = 'class-validator error at line 42';

      expect(error.validationErrors).toHaveProperty('email');
      expect(error.debugSource).toBe('UserController.create');
      expect(error.debugInfo).toBe('class-validator error at line 42');
    });

    it('should handle error with only debugSource', () => {
      const error = new ErrorDebug();
      error.message = 'Internal server error';
      error.debugSource = 'PaymentService.processPayment';

      expect(error.message).toBe('Internal server error');
      expect(error.debugSource).toBe('PaymentService.processPayment');
      expect(error.debugInfo).toBeUndefined();
    });

    it('should handle error with only debugInfo', () => {
      const error = new ErrorDebug();
      error.message = 'Unexpected error occurred';
      error.debugInfo = 'TypeError: Cannot read property "id" of undefined';

      expect(error.message).toBe('Unexpected error occurred');
      expect(error.debugInfo).toBe(
        'TypeError: Cannot read property "id" of undefined',
      );
      expect(error.debugSource).toBeUndefined();
    });

    it('should handle complex debugging scenario', () => {
      const error = new ErrorDebug();
      error.message = 'Failed to process user registration';
      error.code = 'REGISTRATION_ERROR';
      error.validationErrors = {
        username: ['Already exists'],
        email: ['Invalid domain'],
      };
      error.debugSource = 'AuthService.register';
      error.debugInfo = JSON.stringify({
        attempt: 3,
        timestamp: '2025-11-06T10:00:00Z',
        ipAddress: '192.168.1.1',
      });

      expect(error.message).toBe('Failed to process user registration');
      expect(error.code).toBe('REGISTRATION_ERROR');
      expect(Object.keys(error.validationErrors ?? {})).toHaveLength(2);
      expect(error.debugSource).toBe('AuthService.register');
      expect(error.debugInfo).toContain('attempt');
      expect(error.debugInfo).toContain('timestamp');
    });
  });
});
