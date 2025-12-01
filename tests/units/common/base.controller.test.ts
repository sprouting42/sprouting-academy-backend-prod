import { HttpStatus } from '@nestjs/common';
import { beforeEach, describe, it, expect, vi } from 'vitest';

import type { ErrorDebug } from '@/common/errors/error-info';
import { ErrorCode } from '@/common/errors/types/error-code.type';
import {
  ResponseOutput,
  ResponseOutputWithRequest,
  ResponseOutputWithContent,
} from '@/common/response/response-output';
import { Language } from '@/enums/language.enum';
import { EnvVariables } from '@/modules/config/dto/config.dto';

import { TestController } from './mocks/base.controller.mock';

describe('BaseController', () => {
  let controller: TestController;

  beforeEach(() => {
    controller = new TestController();
    vi.restoreAllMocks();
  });

  describe('actionResponse', () => {
    describe('ResponseOutput', () => {
      it('should create successful response', () => {
        const data = ResponseOutput.success();

        const result = controller.testActionResponse(data);

        expect(result.isSuccessful).toBe(true);
        expect(result.statusCode).toBe(HttpStatus.OK);
        expect(result.correlationId).toBeDefined();
        expect(result.responseDate).toBeDefined();
      });

      it('should create failed response', () => {
        const data = ResponseOutput.fail(
          ErrorCode.create({
            code: 'TEST_ERROR',
            message: 'Test error',
            statusCode: HttpStatus.BAD_REQUEST,
          }),
        );

        const result = controller.testActionResponse(data);

        expect(result.isSuccessful).toBe(false);
        expect(result.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(result.errorMessage).toBe('Test error');
      });

      it('should add correlation ID to response', () => {
        const data = ResponseOutput.success();

        const result = controller.testActionResponse(data);

        expect(result.correlationId).toBeDefined();
        expect(typeof result.correlationId).toBe('string');
        expect(result.correlationId?.length).toBe(21);
      });

      it('should add response date to response', () => {
        const data = ResponseOutput.success();

        const result = controller.testActionResponse(data);

        expect(result.responseDate).toBeDefined();
        expect(typeof result.responseDate).toBe('string');
        expect(() => new Date(result.responseDate as string)).not.toThrow();
      });
    });

    describe('ResponseOutputWithRequest', () => {
      interface TestRequest {
        userId: string;
        action: string;
      }

      it('should create successful response with request in development', () => {
        vi.spyOn(EnvVariables, 'isProduction', 'get').mockReturnValue(false);

        const request: TestRequest = {
          userId: 'user-123',
          action: 'read',
        };
        const data = ResponseOutputWithRequest.successWithRequest(request);

        const result = controller.testActionResponseWithRequest(data);

        expect(result.isSuccessful).toBe(true);
        expect(result.correlationId).toBeDefined();
        expect(result.responseDate).toBeDefined();
      });

      it('should strip request data in production', () => {
        vi.spyOn(EnvVariables, 'isProduction', 'get').mockReturnValue(true);

        const request: TestRequest = {
          userId: 'user-123',
          action: 'read',
        };
        const data = ResponseOutputWithRequest.successWithRequest(request);

        const result = controller.testActionResponseWithRequest(data);

        expect(result.isSuccessful).toBe(true);
        expect(result).not.toHaveProperty('request');
      });

      it('should strip debug info from error details in production', () => {
        vi.spyOn(EnvVariables, 'isProduction', 'get').mockReturnValue(true);

        const request = { userId: 'user-123' };
        const data = ResponseOutputWithRequest.failWithRequest(
          ErrorCode.create({
            code: 'TEST_ERROR',
            message: 'Test error',
            statusCode: HttpStatus.BAD_REQUEST,
          }),
          request,
        );

        // Manually add debug info
        data.errorDetails = {
          message: 'Test error',
          code: 'TEST_ERROR',
          debugInfo: 'Stack trace here',
          debugSource: 'TestController.method',
        };

        const result = controller.testActionResponseWithRequest(data);

        expect(result.errorDetails).toBeDefined();
        expect(result.errorDetails).not.toHaveProperty('debugInfo');
        expect(result.errorDetails).not.toHaveProperty('debugSource');
        expect(result.errorDetails).toHaveProperty('message');
        expect(result.errorDetails).toHaveProperty('code');
      });

      it('should keep debug info in development', () => {
        vi.spyOn(EnvVariables, 'isProduction', 'get').mockReturnValue(false);

        const request = { userId: 'user-123' };
        const data = ResponseOutputWithRequest.failWithRequest(
          ErrorCode.create({
            code: 'TEST_ERROR',
            message: 'Test error',
            statusCode: HttpStatus.BAD_REQUEST,
          }),
          request,
        );

        data.errorDetails = {
          message: 'Test error',
          code: 'TEST_ERROR',
          debugInfo: 'Stack trace here',
          debugSource: 'TestController.method',
        };

        const result = controller.testActionResponseWithRequest(data);

        expect(result.errorDetails).toHaveProperty('debugInfo');
        expect(result.errorDetails).toHaveProperty('debugSource');
      });
    });

    describe('ResponseOutputWithContent', () => {
      interface TestUser {
        id: string;
        name: string;
      }

      it('should create successful response with content', () => {
        vi.spyOn(EnvVariables, 'isProduction', 'get').mockReturnValue(false);

        const request = { userId: 'user-123' };
        const content: TestUser = { id: 'user-123', name: 'John Doe' };
        const data = ResponseOutputWithContent.successWithContent(
          request,
          content,
        );

        const result = controller.testActionResponseWithContent(data);

        expect(result.isSuccessful).toBe(true);
        // Response type doesn't have responseContent at compile time
        // but it's added at runtime
      });

      it('should strip request in production but keep content', () => {
        vi.spyOn(EnvVariables, 'isProduction', 'get').mockReturnValue(true);

        const request = { userId: 'user-123' };
        const content: TestUser = { id: 'user-123', name: 'John Doe' };
        const data = ResponseOutputWithContent.successWithContent(
          request,
          content,
        );

        const result = controller.testActionResponseWithContent(data);

        expect(result.isSuccessful).toBe(true);
        expect(result).not.toHaveProperty('request');
      });
    });
  });

  describe('actionResponseError', () => {
    it('should handle Error instance', () => {
      const error = new Error('Test error message');

      const result = controller.testActionResponseError(Language.EN, error);

      expect(result.isSuccessful).toBe(false);
      expect(result.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.errorMessage).toBe(
        'An unexpected server error occurred. Please try again later.',
      );
      expect(result.errorDetails?.message).toBe('Test error message');
    });

    it('should handle Error with custom name', () => {
      const error = new Error('Test error');
      error.name = 'CustomError';

      const result = controller.testActionResponseError(Language.EN, error);

      expect(result.errorDetails?.code).toBe('CustomError');
    });

    it('should handle Error with stack trace', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at line 1';

      const result = controller.testActionResponseError(Language.EN, error);

      expect(result.errorDetails).toHaveProperty('debugInfo');
    });

    it('should handle Error with null stack', () => {
      const error = new Error('Test error');
      error.stack = null as unknown as string;

      const result = controller.testActionResponseError(Language.EN, error);

      expect(result.errorDetails).toBeDefined();
      expect((result.errorDetails as ErrorDebug)?.debugInfo).toBe('');
    });

    it('should handle Error with undefined stack', () => {
      const error = new Error('Test error');
      error.stack = undefined;

      const result = controller.testActionResponseError(Language.EN, error);

      expect(result.errorDetails).toBeDefined();
      expect((result.errorDetails as ErrorDebug)?.debugInfo).toBe(true);
    });

    it('should handle Error with null name', () => {
      const error = new Error('Test error');
      error.name = null as unknown as string;

      const result = controller.testActionResponseError(Language.EN, error);

      expect(result.errorDetails).toBeDefined();
      expect((result.errorDetails as ErrorDebug)?.debugSource).toBe('');
    });

    it('should handle Error with undefined name', () => {
      const error = new Error('Test error');
      error.name = undefined as unknown as string;

      const result = controller.testActionResponseError(Language.EN, error);

      expect(result.errorDetails).toBeDefined();
      expect((result.errorDetails as ErrorDebug)?.debugSource).toBe(true);
    });

    it('should handle non-Error exceptions as strings', () => {
      const error = 'String error message';

      const result = controller.testActionResponseError(Language.EN, error);

      expect(result.isSuccessful).toBe(false);
      expect(result.errorDetails?.message).toBe('String error message');
    });

    it('should handle number as exception', () => {
      const error = 500;

      const result = controller.testActionResponseError(Language.EN, error);

      expect(result.errorDetails?.message).toBe('500');
    });

    it('should handle object as exception', () => {
      const error = { error: 'test' };

      const result = controller.testActionResponseError(Language.EN, error);

      expect(result.errorDetails?.message).toBe('[object Object]');
    });

    it('should handle custom status code', () => {
      const error = new Error('Not found');

      const result = controller.testActionResponseError(
        Language.EN,
        error,
        {},
        HttpStatus.NOT_FOUND,
      );

      expect(result.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('should include value in response', () => {
      const error = new Error('Test error');
      const value = { userId: 'user-123', action: 'create' };

      const result = controller.testActionResponseError(
        Language.EN,
        error,
        value,
      );

      expect(result.isSuccessful).toBe(false);
    });

    it('should use empty object when value is undefined', () => {
      const error = new Error('Test error');

      const result = controller.testActionResponseError(Language.EN, error);

      expect(result.isSuccessful).toBe(false);
    });

    it('should handle BAD_REQUEST status code', () => {
      const error = new Error('Validation error');

      const result = controller.testActionResponseError(
        Language.EN,
        error,
        {},
        HttpStatus.BAD_REQUEST,
      );

      expect(result.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(result.errorDetails?.code).toBe('Error');
    });

    it('should use status code as error code when no error name', () => {
      const error = 'Plain string error';

      const result = controller.testActionResponseError(
        Language.EN,
        error,
        {},
        HttpStatus.NOT_FOUND,
      );

      expect(result.errorDetails?.code).toBe('404');
    });

    it('should handle UNAUTHORIZED status', () => {
      const error = new Error('Unauthorized');

      const result = controller.testActionResponseError(
        Language.EN,
        error,
        {},
        HttpStatus.UNAUTHORIZED,
      );

      expect(result.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should handle FORBIDDEN status', () => {
      const error = new Error('Forbidden');

      const result = controller.testActionResponseError(
        Language.EN,
        error,
        {},
        HttpStatus.FORBIDDEN,
      );

      expect(result.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    it('should handle CONFLICT status', () => {
      const error = new Error('Conflict');

      const result = controller.testActionResponseError(
        Language.EN,
        error,
        {},
        HttpStatus.CONFLICT,
      );

      expect(result.statusCode).toBe(HttpStatus.CONFLICT);
    });

    it('should add correlation ID and response date', () => {
      const error = new Error('Test error');

      const result = controller.testActionResponseError(Language.EN, error);

      expect(result.correlationId).toBeDefined();
      expect(result.responseDate).toBeDefined();
      expect(result.correlationId?.length).toBe(21);
    });

    it('should handle Error without name', () => {
      const error = new Error('Test error');
      // Set name to empty string instead of deleting
      error.name = '';

      const result = controller.testActionResponseError(Language.EN, error);

      expect(result.errorDetails?.code).toBe('500');
    });

    it('should handle Error without name with custom status code', () => {
      const error = new Error('Test error');
      error.name = '';

      const result = controller.testActionResponseError(
        Language.EN,
        error,
        {},
        HttpStatus.BAD_REQUEST,
      );

      expect(result.errorDetails?.code).toBe('400');
    });

    it('should handle non-Error exception with numeric status code', () => {
      const exception = 'Something went wrong';

      const result = controller.testActionResponseError(
        Language.EN,
        exception,
        {},
        HttpStatus.FORBIDDEN,
      );

      expect(result.errorDetails?.code).toBe('403');
      expect(result.errorDetails?.message).toBe('Something went wrong');
    });

    it('should handle Error without stack', () => {
      const error = new Error('Test error');
      delete error.stack;

      const result = controller.testActionResponseError(Language.EN, error);

      expect(result.errorDetails).toHaveProperty('debugInfo');
    });
  });

  describe('Integration Tests', () => {
    it('should handle successful request flow', () => {
      const data = ResponseOutput.success(HttpStatus.CREATED);

      const result = controller.testActionResponse(data);

      expect(result.isSuccessful).toBe(true);
      expect(result.statusCode).toBe(HttpStatus.CREATED);
      expect(result.correlationId).toBeDefined();
    });

    it('should handle error flow with exception', () => {
      const error = new Error('Database connection failed');
      error.name = 'DatabaseError';

      const result = controller.testActionResponseError(
        Language.EN,
        error,
        { query: 'SELECT * FROM users' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      expect(result.isSuccessful).toBe(false);
      expect(result.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.errorDetails?.code).toBe('DatabaseError');
      expect(result.errorDetails?.message).toBe('Database connection failed');
    });

    it('should handle production environment correctly', () => {
      vi.spyOn(EnvVariables, 'isProduction', 'get').mockReturnValue(true);

      const request = { userId: 'user-123' };
      const data = ResponseOutputWithRequest.successWithRequest(request);

      const result = controller.testActionResponseWithRequest(data);

      expect(result).not.toHaveProperty('request');
      expect(result.correlationId).toBeDefined();
    });

    it('should handle development environment correctly', () => {
      vi.spyOn(EnvVariables, 'isProduction', 'get').mockReturnValue(false);

      const request = { userId: 'user-123' };
      const data = ResponseOutputWithRequest.successWithRequest(request);

      const result = controller.testActionResponseWithRequest(data);

      expect(result.correlationId).toBeDefined();
    });
  });

  describe('Error Response Creation', () => {
    it('should create consistent error responses', () => {
      const error = new Error('Consistent error');

      const result1 = controller.testActionResponseError(Language.EN, error);
      const result2 = controller.testActionResponseError(Language.EN, error);

      expect(result1.errorMessage).toBe(result2.errorMessage);
      expect(result1.statusCode).toBe(result2.statusCode);
      expect(result1.errorDetails?.message).toBe(result2.errorDetails?.message);
    });

    it('should handle multiple different errors', () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');

      const result1 = controller.testActionResponseError(Language.EN, error1);
      const result2 = controller.testActionResponseError(Language.EN, error2);

      expect(result1.errorDetails?.message).toBe('Error 1');
      expect(result2.errorDetails?.message).toBe('Error 2');
      expect(result1.correlationId).not.toBe(result2.correlationId);
    });
  });
});
