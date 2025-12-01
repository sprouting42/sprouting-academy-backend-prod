import { HttpStatus } from '@nestjs/common';
import { describe, it, expect } from 'vitest';

import { Response } from '@/common/response/response';

describe('Response', () => {
  describe('Constructor', () => {
    it('should create Response instance with all properties', () => {
      const responseData = {
        correlationId: 'test-correlation-id',
        responseDate: '2024-01-01T00:00:00.000Z',
        statusCode: HttpStatus.OK,
        status: '200',
        isSuccessful: true,
      };

      const response = new Response(responseData);

      expect(response.correlationId).toBe('test-correlation-id');
      expect(response.responseDate).toBe('2024-01-01T00:00:00.000Z');
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.status).toBe('200');
      expect(response.isSuccessful).toBe(true);
    });

    it('should create Response instance with partial properties', () => {
      const responseData = {
        statusCode: HttpStatus.NOT_FOUND,
        status: '404',
        isSuccessful: false,
      };

      const response = new Response(responseData);

      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(response.status).toBe('404');
      expect(response.isSuccessful).toBe(false);
      expect(response.correlationId).toBeUndefined();
      expect(response.responseDate).toBeUndefined();
    });

    it('should create Response with error details', () => {
      const errorDetails = {
        message: 'Not found',
        code: '404',
      };

      const response = new Response({
        statusCode: HttpStatus.NOT_FOUND,
        status: '404',
        isSuccessful: false,
        errorMessage: 'Resource not found',
        errorDetails,
      });

      expect(response.errorMessage).toBe('Resource not found');
      expect(response.errorDetails).toEqual(errorDetails);
    });

    it('should create Response with debug error details', () => {
      const errorDetails = {
        message: 'Internal error',
        code: '500',
        debugInfo: 'Stack trace here',
        debugSource: 'UserController.getUser',
      };

      const response = new Response({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: '500',
        isSuccessful: false,
        errorDetails,
      });

      expect(response.errorDetails).toEqual(errorDetails);
    });

    it('should create empty Response instance', () => {
      const response = new Response();

      expect(response.isSuccessful).toBe(false);
      expect(response.statusCode).toBeUndefined();
      expect(response.status).toBeUndefined();
    });

    it('should handle undefined input', () => {
      const response = new Response(undefined);

      expect(response.isSuccessful).toBe(false);
    });
  });

  describe('create static method', () => {
    it('should create Response using static factory method', () => {
      const responseData = {
        correlationId: 'factory-id',
        responseDate: '2024-01-01T00:00:00.000Z',
        statusCode: HttpStatus.CREATED,
        status: '201',
        isSuccessful: true,
      };

      const response = Response.create(responseData);

      expect(response).toBeInstanceOf(Response);
      expect(response.correlationId).toBe('factory-id');
      expect(response.statusCode).toBe(HttpStatus.CREATED);
      expect(response.isSuccessful).toBe(true);
    });

    it('should create Response with partial data using factory method', () => {
      const response = Response.create({
        statusCode: HttpStatus.BAD_REQUEST,
        status: '400',
        isSuccessful: false,
      });

      expect(response).toBeInstanceOf(Response);
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(response.isSuccessful).toBe(false);
    });

    it('should create empty Response using factory method', () => {
      const response = Response.create();

      expect(response).toBeInstanceOf(Response);
      expect(response.isSuccessful).toBe(false);
    });
  });

  describe('HTTP Status Codes', () => {
    it('should handle success status codes', () => {
      const successCodes = [
        HttpStatus.OK,
        HttpStatus.CREATED,
        HttpStatus.ACCEPTED,
        HttpStatus.NO_CONTENT,
      ];

      successCodes.forEach(code => {
        const response = Response.create({
          statusCode: code,
          status: code.toString(),
          isSuccessful: true,
        });

        expect(response.statusCode).toBe(code);
        expect(response.isSuccessful).toBe(true);
      });
    });

    it('should handle client error status codes', () => {
      const clientErrorCodes = [
        HttpStatus.BAD_REQUEST,
        HttpStatus.UNAUTHORIZED,
        HttpStatus.FORBIDDEN,
        HttpStatus.NOT_FOUND,
        HttpStatus.CONFLICT,
      ];

      clientErrorCodes.forEach(code => {
        const response = Response.create({
          statusCode: code,
          status: code.toString(),
          isSuccessful: false,
        });

        expect(response.statusCode).toBe(code);
        expect(response.isSuccessful).toBe(false);
      });
    });

    it('should handle server error status codes', () => {
      const serverErrorCodes = [
        HttpStatus.INTERNAL_SERVER_ERROR,
        HttpStatus.NOT_IMPLEMENTED,
        HttpStatus.BAD_GATEWAY,
        HttpStatus.SERVICE_UNAVAILABLE,
      ];

      serverErrorCodes.forEach(code => {
        const response = Response.create({
          statusCode: code,
          status: code.toString(),
          isSuccessful: false,
        });

        expect(response.statusCode).toBe(code);
        expect(response.isSuccessful).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should store error message for failed requests', () => {
      const response = Response.create({
        statusCode: HttpStatus.BAD_REQUEST,
        status: '400',
        isSuccessful: false,
        errorMessage: 'Invalid input data',
      });

      expect(response.errorMessage).toBe('Invalid input data');
    });

    it('should store error details with code and message', () => {
      const errorDetails = {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
      };

      const response = Response.create({
        statusCode: HttpStatus.BAD_REQUEST,
        status: '400',
        isSuccessful: false,
        errorDetails,
      });

      expect(response.errorDetails).toEqual(errorDetails);
    });

    it('should store validation errors', () => {
      const errorDetails = {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        validationErrors: {
          email: ['Email is required', 'Email must be valid'],
          password: ['Password must be at least 8 characters'],
        },
      };

      const response = Response.create({
        statusCode: HttpStatus.BAD_REQUEST,
        status: '400',
        isSuccessful: false,
        errorDetails,
      });

      expect(response.errorDetails).toEqual(errorDetails);
    });
  });

  describe('Correlation and Timestamps', () => {
    it('should handle correlation ID for request tracing', () => {
      const correlationId = 'nano-id-12345678901234567890';

      const response = Response.create({
        correlationId,
        statusCode: HttpStatus.OK,
        status: '200',
        isSuccessful: true,
      });

      expect(response.correlationId).toBe(correlationId);
    });

    it('should handle ISO 8601 formatted response dates', () => {
      const responseDate = '2024-01-15T12:30:45.123Z';

      const response = Response.create({
        responseDate,
        statusCode: HttpStatus.OK,
        status: '200',
        isSuccessful: true,
      });

      expect(response.responseDate).toBe(responseDate);
    });

    it('should handle both correlation ID and response date', () => {
      const correlationId = 'trace-id-abc123';
      const responseDate = new Date().toISOString();

      const response = Response.create({
        correlationId,
        responseDate,
        statusCode: HttpStatus.OK,
        status: '200',
        isSuccessful: true,
      });

      expect(response.correlationId).toBe(correlationId);
      expect(response.responseDate).toBe(responseDate);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should create successful GET response', () => {
      const response = Response.create({
        correlationId: 'get-request-123',
        responseDate: new Date().toISOString(),
        statusCode: HttpStatus.OK,
        status: '200',
        isSuccessful: true,
      });

      expect(response.isSuccessful).toBe(true);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('should create successful POST response', () => {
      const response = Response.create({
        correlationId: 'post-request-456',
        responseDate: new Date().toISOString(),
        statusCode: HttpStatus.CREATED,
        status: '201',
        isSuccessful: true,
      });

      expect(response.isSuccessful).toBe(true);
      expect(response.statusCode).toBe(HttpStatus.CREATED);
    });

    it('should create not found error response', () => {
      const response = Response.create({
        correlationId: 'get-request-789',
        responseDate: new Date().toISOString(),
        statusCode: HttpStatus.NOT_FOUND,
        status: '404',
        isSuccessful: false,
        errorMessage: 'User not found',
        errorDetails: {
          message: 'User with ID 123 not found',
          code: 'USER_NOT_FOUND',
        },
      });

      expect(response.isSuccessful).toBe(false);
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(response.errorMessage).toBe('User not found');
    });

    it('should create validation error response', () => {
      const response = Response.create({
        correlationId: 'post-request-101',
        responseDate: new Date().toISOString(),
        statusCode: HttpStatus.BAD_REQUEST,
        status: '400',
        isSuccessful: false,
        errorMessage: 'Validation failed',
        errorDetails: {
          message: 'Request validation failed',
          code: 'VALIDATION_ERROR',
          validationErrors: {
            email: ['Invalid email format'],
            age: ['Age must be a positive number'],
          },
        },
      });

      expect(response.isSuccessful).toBe(false);
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should create internal server error response with debug info', () => {
      const response = Response.create({
        correlationId: 'request-error-202',
        responseDate: new Date().toISOString(),
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: '500',
        isSuccessful: false,
        errorMessage: 'An unexpected error occurred',
        errorDetails: {
          message: 'Database connection failed',
          code: 'DATABASE_ERROR',
          debugInfo: 'Error: connection timeout at line 42',
          debugSource: 'DatabaseService.connect',
        },
      });

      expect(response.isSuccessful).toBe(false);
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(response.errorDetails).toHaveProperty('debugInfo');
      expect(response.errorDetails).toHaveProperty('debugSource');
    });
  });

  describe('ApiProperty decorator type functions', () => {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment */
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    /* eslint-disable @typescript-eslint/no-unsafe-call */
    it('should have type metadata for errorDetails property', () => {
      const metadata = Reflect.getMetadata(
        'swagger/apiModelProperties',
        Response.prototype,
        'errorDetails',
      );

      expect(metadata).toBeDefined();
      if (typeof metadata?.type === 'function') {
        const typeResult = metadata.type();
        expect(typeResult).toBeDefined();
      }
    });
    /* eslint-enable @typescript-eslint/no-unsafe-assignment */
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */
    /* eslint-enable @typescript-eslint/no-unsafe-call */
  });
});
