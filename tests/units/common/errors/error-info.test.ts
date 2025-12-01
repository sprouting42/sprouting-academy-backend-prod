/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import 'reflect-metadata';

import { describe, expect, it } from 'vitest';

import { ErrorDebug, ErrorDetail } from '@/common/errors/error-info';

describe('error-info', () => {
  describe('ErrorDetail', () => {
    it('should be instantiable', () => {
      const error = new ErrorDetail();
      expect(error).toBeInstanceOf(ErrorDetail);
      expect(error).toBeDefined();
    });

    it('should create an instance with message', () => {
      const error = new ErrorDetail();
      error.message = 'Test error message';

      expect(error.message).toBe('Test error message');
    });

    it('should have optional code property', () => {
      const error = new ErrorDetail();
      error.message = 'Test error';
      error.code = 'TEST_ERROR';

      expect(error.code).toBe('TEST_ERROR');
    });

    it('should have optional validationErrors property', () => {
      const error = new ErrorDetail();
      error.message = 'Validation failed';
      error.validationErrors = {
        email: ['Invalid email format'],
        password: ['Too short', 'Missing special character'],
      };

      expect(error.validationErrors).toBeDefined();
      expect(error.validationErrors?.email).toEqual(['Invalid email format']);
      expect(error.validationErrors?.password).toHaveLength(2);
    });

    it('should work without optional properties', () => {
      const error = new ErrorDetail();
      error.message = 'Simple error';

      expect(error.message).toBe('Simple error');
      expect(error.code).toBeUndefined();
      expect(error.validationErrors).toBeUndefined();
    });

    it('should handle empty validation errors', () => {
      const error = new ErrorDetail();
      error.message = 'Error';
      error.validationErrors = {};

      expect(error.validationErrors).toEqual({});
    });

    it('should have ApiProperty decorator metadata for message', () => {
      const metadata = Reflect.getMetadata(
        'swagger/apiModelProperties',
        ErrorDetail.prototype,
        'message',
      );

      expect(metadata).toBeDefined();
      expect(metadata.description).toBe(
        'Human-readable message describing the error',
      );
    });

    it('should have ApiPropertyOptional decorator metadata for code', () => {
      const metadata = Reflect.getMetadata(
        'swagger/apiModelProperties',
        ErrorDetail.prototype,
        'code',
      );

      expect(metadata).toBeDefined();
      expect(metadata.example).toBe('VALIDATION_ERROR');
      expect(metadata.description).toBe('Optional machine-readable error code');
    });

    it('should have ApiPropertyOptional decorator metadata for validationErrors', () => {
      const metadata = Reflect.getMetadata(
        'swagger/apiModelProperties',
        ErrorDetail.prototype,
        'validationErrors',
      );

      expect(metadata).toBeDefined();
      expect(metadata.description).toBe(
        'Detailed validation errors (if applicable)',
      );
      expect(metadata.type).toBe('object');
    });
  });

  describe('ErrorDebug', () => {
    it('should be instantiable', () => {
      const error = new ErrorDebug();
      expect(error).toBeInstanceOf(ErrorDebug);
      expect(error).toBeInstanceOf(ErrorDetail);
      expect(error).toBeDefined();
    });

    it('should extend ErrorDetail', () => {
      const error = new ErrorDebug();
      error.message = 'Debug error';

      expect(error.message).toBe('Debug error');
      expect(error).toBeInstanceOf(ErrorDetail);
    });

    it('should have optional debugSource property', () => {
      const error = new ErrorDebug();
      error.message = 'Test error';
      error.debugSource = 'UserService.createUser';

      expect(error.debugSource).toBe('UserService.createUser');
    });

    it('should have optional debugInfo property', () => {
      const error = new ErrorDebug();
      error.message = 'Test error';
      error.debugInfo = 'Stack trace or additional context';

      expect(error.debugInfo).toBe('Stack trace or additional context');
    });

    it('should support all ErrorDetail properties', () => {
      const error = new ErrorDebug();
      error.message = 'Complex error';
      error.code = 'COMPLEX_ERROR';
      error.validationErrors = { field: ['error'] };
      error.debugSource = 'TestService';
      error.debugInfo = 'Debug context';

      expect(error.message).toBe('Complex error');
      expect(error.code).toBe('COMPLEX_ERROR');
      expect(error.validationErrors).toEqual({ field: ['error'] });
      expect(error.debugSource).toBe('TestService');
      expect(error.debugInfo).toBe('Debug context');
    });

    it('should work without debug properties', () => {
      const error = new ErrorDebug();
      error.message = 'Error without debug info';

      expect(error.message).toBe('Error without debug info');
      expect(error.debugSource).toBeUndefined();
      expect(error.debugInfo).toBeUndefined();
    });

    it('should handle only debugSource', () => {
      const error = new ErrorDebug();
      error.message = 'Error';
      error.debugSource = 'Source only';

      expect(error.debugSource).toBe('Source only');
      expect(error.debugInfo).toBeUndefined();
    });

    it('should handle only debugInfo', () => {
      const error = new ErrorDebug();
      error.message = 'Error';
      error.debugInfo = 'Info only';

      expect(error.debugInfo).toBe('Info only');
      expect(error.debugSource).toBeUndefined();
    });

    it('should have ApiPropertyOptional decorator metadata for debugSource', () => {
      const metadata = Reflect.getMetadata(
        'swagger/apiModelProperties',
        ErrorDebug.prototype,
        'debugSource',
      );

      expect(metadata).toBeDefined();
      expect(metadata.description).toBe(
        'The source or method where the error originated',
      );
    });

    it('should have ApiPropertyOptional decorator metadata for debugInfo', () => {
      const metadata = Reflect.getMetadata(
        'swagger/apiModelProperties',
        ErrorDebug.prototype,
        'debugInfo',
      );

      expect(metadata).toBeDefined();
      expect(metadata.description).toBe(
        'Additional developer-facing debug information',
      );
    });

    it('should inherit parent decorator metadata', () => {
      const messageMetadata = Reflect.getMetadata(
        'swagger/apiModelProperties',
        ErrorDebug.prototype,
        'message',
      );

      expect(messageMetadata).toBeDefined();
      expect(messageMetadata.description).toBe(
        'Human-readable message describing the error',
      );
    });
  });
});
