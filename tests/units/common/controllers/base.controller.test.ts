import { HttpStatus } from '@nestjs/common';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { BaseController } from '@/common/controllers/base.controller';
import type { ErrorDebug } from '@/common/errors/error-info';
import { ErrorCode } from '@/common/errors/types/error-code.type';
import type { ResponseContent } from '@/common/response/response-content';
import {
  ResponseOutput,
  ResponseOutputWithRequest,
  ResponseOutputWithContent,
} from '@/common/response/response-output';
import { Language } from '@/enums/language.enum';
import { EnvVariables } from '@/modules/config/dto/config.dto';

class TestController extends BaseController {
  testActionResponse(data: ResponseOutput): ResponseContent<unknown> {
    return this.actionResponse(data);
  }

  testActionResponseWithRequest<T>(
    data: ResponseOutputWithRequest<T>,
  ): ResponseContent<T> {
    return this.actionResponse(data);
  }

  testActionResponseWithContent<TRequest, TResponse>(
    data: ResponseOutputWithContent<TRequest, TResponse>,
  ): ResponseContent<TResponse> {
    return this.actionResponse(data);
  }

  testActionResponseError(
    language: Language,
    ex: unknown,
    value?: object,
    statusCode?: HttpStatus,
  ): ResponseContent<unknown> {
    return this.actionResponseError(language, ex, value, statusCode);
  }
}

describe('BaseController', () => {
  let controller: TestController;
  let originalIsProduction: boolean;

  beforeEach(() => {
    controller = new TestController();
    originalIsProduction = EnvVariables.isProduction;
  });

  afterEach(() => {
    Object.defineProperty(EnvVariables, 'isProduction', {
      value: originalIsProduction,
      writable: true,
      configurable: true,
    });
  });

  describe('actionResponse', () => {
    it('should handle ResponseOutput', () => {
      const data = ResponseOutput.success();
      const result = controller.testActionResponse(data);

      expect(result.isSuccessful).toBe(true);
      expect(result.correlationId).toBeDefined();
      expect(result.responseDate).toBeDefined();
    });

    it('should handle ResponseOutputWithRequest', () => {
      const request = { userId: '123' };
      const data = ResponseOutputWithRequest.successWithRequest(request);
      const result = controller.testActionResponseWithRequest(data);

      expect(result.isSuccessful).toBe(true);
      expect(result.correlationId).toBeDefined();
    });

    it('should handle ResponseOutputWithContent', () => {
      const request = { email: 'test@example.com' };
      const content = { token: 'abc123' };
      const data = ResponseOutputWithContent.successWithContent(
        request,
        content,
      );
      const result = controller.testActionResponseWithContent(data);

      expect(result.isSuccessful).toBe(true);
      expect(result.responseContent).toEqual(content);
    });

    it('should strip request and debug info in production mode', () => {
      Object.defineProperty(EnvVariables, 'isProduction', {
        value: true,
        writable: true,
        configurable: true,
      });

      const request = { sensitiveData: 'secret' };
      const errorCode = ErrorCode.create({
        code: 'TEST_ERROR',
        message: 'Test error',
        statusCode: HttpStatus.BAD_REQUEST,
      });

      const data = ResponseOutputWithContent.failWithContent(
        errorCode,
        request,
        Language.EN,
      );

      // Add debug info
      data.errorDetails = {
        message: 'Error message',
        code: 'TEST_ERROR',
        debugInfo: 'Debug stack trace',
        debugSource: 'test.ts',
      };

      const result = controller.testActionResponseWithContent(data);

      expect(result.isSuccessful).toBe(false);
      expect((result.errorDetails as ErrorDebug)?.debugInfo).toBeUndefined();
      expect((result.errorDetails as ErrorDebug)?.debugSource).toBeUndefined();
    });

    it('should keep all data in non-production mode', () => {
      Object.defineProperty(EnvVariables, 'isProduction', {
        value: false,
        writable: true,
        configurable: true,
      });

      const request = { data: 'test' };
      const errorCode = ErrorCode.create({
        code: 'TEST_ERROR',
        message: 'Test error',
        statusCode: HttpStatus.BAD_REQUEST,
      });

      const data = ResponseOutputWithContent.failWithContent(
        errorCode,
        request,
        Language.EN,
      );

      data.errorDetails = {
        message: 'Error message',
        code: 'TEST_ERROR',
        debugInfo: 'Debug stack trace',
        debugSource: 'test.ts',
      };

      const result = controller.testActionResponseWithContent(data);

      expect(result.isSuccessful).toBe(false);
      expect((result.errorDetails as ErrorDebug)?.debugInfo).toBe(
        'Debug stack trace',
      );
      expect((result.errorDetails as ErrorDebug)?.debugSource).toBe('test.ts');
    });
  });

  describe('actionResponseError', () => {
    it('should handle Error instances', () => {
      const error = new Error('Test error');
      error.name = 'TestError';

      const result = controller.testActionResponseError(Language.EN, error, {
        input: 'test',
      });

      expect(result.isSuccessful).toBe(false);
      expect(result.errorDetails?.message).toBe('Test error');
      expect(result.errorDetails?.code).toBe('TestError');
    });

    it('should handle non-Error values', () => {
      const result = controller.testActionResponseError(
        Language.EN,
        'String error',
        {
          input: 'test',
        },
      );

      expect(result.isSuccessful).toBe(false);
      expect(result.errorDetails?.message).toBe('String error');
    });

    it('should use provided status code', () => {
      const error = new Error('Not found');

      const result = controller.testActionResponseError(
        Language.EN,
        error,
        {},
        HttpStatus.NOT_FOUND,
      );

      expect(result.isSuccessful).toBe(false);
      expect(result.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('should use default value when no value provided', () => {
      const error = new Error('Test error');

      const result = controller.testActionResponseError(Language.EN, error);

      expect(result.isSuccessful).toBe(false);
    });

    it('should handle non-Error with non-number status code', () => {
      const result = controller.testActionResponseError(
        Language.EN,
        'String error',
        {},
        'NotANumber' as unknown as HttpStatus,
      );

      expect(result.isSuccessful).toBe(false);
      expect(result.errorDetails?.code).toBe('Error');
    });
  });
});
