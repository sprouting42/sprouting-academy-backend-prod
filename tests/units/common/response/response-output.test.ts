import { HttpStatus } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { ERROR_CODES } from '@/common/errors/error-code';
import { ErrorCode } from '@/common/errors/types/error-code.type';
import {
  ResponseOutput,
  ResponseOutputWithRequest,
  ResponseOutputWithContent,
} from '@/common/response/response-output';
import { Language } from '@/enums/language.enum';

describe('ResponseOutput', () => {
  describe('success', () => {
    it('should create successful response with default status code', () => {
      const response = ResponseOutput.success();

      expect(response.isSuccessful).toBe(true);
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.status).toBe('200');
      expect(response.errorMessage).toBeUndefined();
      expect(response.errorDetails).toBeUndefined();
    });

    it('should create successful response with custom status code', () => {
      const response = ResponseOutput.success(HttpStatus.CREATED);

      expect(response.isSuccessful).toBe(true);
      expect(response.statusCode).toBe(HttpStatus.CREATED);
      expect(response.status).toBe('201');
    });

    it('should have correct type', () => {
      const response = ResponseOutput.success();

      expect(response.type).toBe('ResponseOutput');
    });
  });

  describe('fail', () => {
    it('should create failed response with localized message', () => {
      const response = ResponseOutput.fail(
        ERROR_CODES.AUTH.SIGN_IN_ERROR,
        Language.EN,
      );

      expect(response.isSuccessful).toBe(false);
      expect(response.statusCode).toBe(
        ERROR_CODES.AUTH.SIGN_IN_ERROR.statusCode,
      );
      expect(response.errorMessage).toBeDefined();
      expect(response.errorDetails).toBeDefined();
      expect(response.errorDetails?.code).toBe(
        ERROR_CODES.AUTH.SIGN_IN_ERROR.code,
      );
    });

    it('should create failed response with Thai language', () => {
      const response = ResponseOutput.fail(
        ERROR_CODES.AUTH.SIGN_IN_ERROR,
        Language.TH,
      );

      expect(response.isSuccessful).toBe(false);
      expect(response.errorMessage).toBeDefined();
      expect(response.errorDetails).toBeDefined();
    });

    it('should create failed response with default language when not specified', () => {
      const response = ResponseOutput.fail(ERROR_CODES.AUTH.SIGN_IN_ERROR);

      expect(response.isSuccessful).toBe(false);
      expect(response.errorMessage).toBeDefined();
      expect(response.statusCode).toBe(
        ERROR_CODES.AUTH.SIGN_IN_ERROR.statusCode,
      );
    });

    it('should handle error with string message', () => {
      const errorWithString = ErrorCode.create({
        code: 'TEST_ERROR',
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Plain string message',
      });

      const response = ResponseOutput.fail(errorWithString);

      expect(response.isSuccessful).toBe(false);
      expect(response.errorMessage).toBe('Plain string message');
      expect(response.errorDetails?.message).toBe('Plain string message');
      expect(response.errorDetails?.code).toBe('TEST_ERROR');
    });

    it('should set correct status from error code', () => {
      const response = ResponseOutput.fail(ERROR_CODES.AUTH.SIGN_IN_ERROR);

      expect(response.status).toBe(
        ERROR_CODES.AUTH.SIGN_IN_ERROR.statusCode.toString(),
      );
    });
  });

  describe('getErrorMessage', () => {
    it('should return string message when error.message is string', () => {
      const errorWithString = ErrorCode.create({
        code: 'STRING_ERROR',
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Direct string message',
      });

      const response = ResponseOutput.fail(errorWithString);

      expect(response.errorMessage).toBe('Direct string message');
    });

    it('should return localized message when error.message is LocalizedMessage', () => {
      const response = ResponseOutput.fail(
        ERROR_CODES.AUTH.SIGN_IN_ERROR,
        Language.EN,
      );

      expect(response.errorMessage).toBeDefined();
      expect(typeof response.errorMessage).toBe('string');
    });

    it('should use default language when language parameter is undefined', () => {
      const response = ResponseOutput.fail(ERROR_CODES.AUTH.SIGN_IN_ERROR);

      expect(response.errorMessage).toBeDefined();
      expect(typeof response.errorMessage).toBe('string');
    });
  });
});

describe('ResponseOutputWithRequest', () => {
  describe('successWithRequest', () => {
    it('should create successful response with request data', () => {
      const requestData = { email: 'test@example.com' };
      const response =
        ResponseOutputWithRequest.successWithRequest(requestData);

      expect(response.isSuccessful).toBe(true);
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.request).toEqual(requestData);
      expect(response.type).toBe('ResponseOutputWithRequest');
    });

    it('should create successful response with custom status code', () => {
      const requestData = { id: '123' };
      const response = ResponseOutputWithRequest.successWithRequest(
        requestData,
        HttpStatus.CREATED,
      );

      expect(response.isSuccessful).toBe(true);
      expect(response.statusCode).toBe(HttpStatus.CREATED);
      expect(response.request).toEqual(requestData);
    });

    it('should handle complex request objects', () => {
      const requestData = {
        email: 'test@example.com',
        nested: { value: 123 },
        array: [1, 2, 3],
      };
      const response =
        ResponseOutputWithRequest.successWithRequest(requestData);

      expect(response.request).toEqual(requestData);
    });
  });

  describe('failWithRequest', () => {
    it('should create failed response with request data and language', () => {
      const requestData = { email: 'test@example.com' };
      const response = ResponseOutputWithRequest.failWithRequest(
        ERROR_CODES.AUTH.SIGN_IN_ERROR,
        requestData,
        Language.EN,
      );

      expect(response.isSuccessful).toBe(false);
      expect(response.request).toEqual(requestData);
      expect(response.errorMessage).toBeDefined();
      expect(response.errorDetails).toBeDefined();
    });

    it('should create failed response with default language', () => {
      const requestData = { email: 'test@example.com' };
      const response = ResponseOutputWithRequest.failWithRequest(
        ERROR_CODES.AUTH.SIGN_IN_ERROR,
        requestData,
      );

      expect(response.isSuccessful).toBe(false);
      expect(response.request).toEqual(requestData);
    });

    it('should handle Thai language', () => {
      const requestData = { email: 'test@example.com' };
      const response = ResponseOutputWithRequest.failWithRequest(
        ERROR_CODES.AUTH.SIGN_IN_ERROR,
        requestData,
        Language.TH,
      );

      expect(response.isSuccessful).toBe(false);
      expect(response.errorMessage).toBeDefined();
    });

    it('should preserve request data in failed response', () => {
      const requestData = { email: 'test@example.com', name: 'Test User' };
      const response = ResponseOutputWithRequest.failWithRequest(
        ERROR_CODES.AUTH.SIGN_IN_ERROR,
        requestData,
        Language.EN,
      );

      expect(response.request).toEqual(requestData);
      expect(response.request?.email).toBe('test@example.com');
    });
  });
});

describe('ResponseOutputWithContent', () => {
  describe('successWithContent', () => {
    it('should create successful response with request and content', () => {
      const requestData = { email: 'test@example.com' };
      const contentData = { token: 'abc123', userId: '456' };
      const response = ResponseOutputWithContent.successWithContent(
        requestData,
        contentData,
      );

      expect(response.isSuccessful).toBe(true);
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.request).toEqual(requestData);
      expect(response.responseContent).toEqual(contentData);
      expect(response.type).toBe('ResponseOutputWithContent');
    });

    it('should create successful response with custom status code', () => {
      const requestData = { id: '123' };
      const contentData = { message: 'Created' };
      const response = ResponseOutputWithContent.successWithContent(
        requestData,
        contentData,
        HttpStatus.CREATED,
      );

      expect(response.isSuccessful).toBe(true);
      expect(response.statusCode).toBe(HttpStatus.CREATED);
      expect(response.responseContent).toEqual(contentData);
    });

    it('should handle null content', () => {
      const requestData = { id: '123' };
      const response = ResponseOutputWithContent.successWithContent(
        requestData,
        null,
      );

      expect(response.isSuccessful).toBe(true);
      expect(response.responseContent).toBeNull();
    });

    it('should handle complex nested content', () => {
      const requestData = { email: 'test@example.com' };
      const contentData = {
        user: {
          id: '123',
          profile: { name: 'Test', age: 30 },
        },
        tokens: ['token1', 'token2'],
      };
      const response = ResponseOutputWithContent.successWithContent(
        requestData,
        contentData,
      );

      expect(response.responseContent).toEqual(contentData);
    });
  });

  describe('failWithContent', () => {
    it('should create failed response with request data and language', () => {
      const requestData = { email: 'test@example.com' };
      const response = ResponseOutputWithContent.failWithContent(
        ERROR_CODES.AUTH.SIGN_IN_ERROR,
        requestData,
        Language.EN,
      );

      expect(response.isSuccessful).toBe(false);
      expect(response.request).toEqual(requestData);
      expect(response.errorMessage).toBeDefined();
      expect(response.errorDetails).toBeDefined();
      expect(response.responseContent).toBeUndefined();
    });

    it('should create failed response with default language', () => {
      const requestData = { email: 'test@example.com' };
      const response = ResponseOutputWithContent.failWithContent(
        ERROR_CODES.AUTH.SIGN_IN_ERROR,
        requestData,
      );

      expect(response.isSuccessful).toBe(false);
      expect(response.request).toEqual(requestData);
    });

    it('should handle Thai language', () => {
      const requestData = { email: 'test@example.com' };
      const response = ResponseOutputWithContent.failWithContent(
        ERROR_CODES.AUTH.SIGN_IN_ERROR,
        requestData,
        Language.TH,
      );

      expect(response.isSuccessful).toBe(false);
      expect(response.errorMessage).toBeDefined();
    });

    it('should include error code in details', () => {
      const requestData = { email: 'test@example.com' };
      const response = ResponseOutputWithContent.failWithContent(
        ERROR_CODES.AUTH.SIGN_IN_ERROR,
        requestData,
        Language.EN,
      );

      expect(response.errorDetails?.code).toBe(
        ERROR_CODES.AUTH.SIGN_IN_ERROR.code,
      );
    });

    it('should not have responseContent in failed response', () => {
      const requestData = { email: 'test@example.com' };
      const response = ResponseOutputWithContent.failWithContent(
        ERROR_CODES.AUTH.SIGN_IN_ERROR,
        requestData,
        Language.EN,
      );

      expect(response.responseContent).toBeUndefined();
    });
  });

  describe('type hierarchy', () => {
    it('should maintain type property through hierarchy', () => {
      const base = ResponseOutput.success();
      const withRequest = ResponseOutputWithRequest.successWithRequest({});
      const withContent = ResponseOutputWithContent.successWithContent({}, {});

      expect(base.type).toBe('ResponseOutput');
      expect(withRequest.type).toBe('ResponseOutputWithRequest');
      expect(withContent.type).toBe('ResponseOutputWithContent');
    });

    it('should be instance of parent classes', () => {
      const withContent = ResponseOutputWithContent.successWithContent({}, {});

      expect(withContent).toBeInstanceOf(ResponseOutputWithContent);
      expect(withContent).toBeInstanceOf(ResponseOutputWithRequest);
      expect(withContent).toBeInstanceOf(ResponseOutput);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle sign-in success flow', () => {
      const requestData = { email: 'user@example.com' };
      const contentData = {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
        expiresIn: 3600,
      };
      const response = ResponseOutputWithContent.successWithContent(
        requestData,
        contentData,
        HttpStatus.OK,
      );

      expect(response.isSuccessful).toBe(true);
      expect(response.request?.email).toBe('user@example.com');
      expect(response.responseContent?.token).toBeDefined();
    });

    it('should handle sign-in error flow with English', () => {
      const requestData = { email: 'invalid@example.com' };
      const response = ResponseOutputWithContent.failWithContent(
        ERROR_CODES.AUTH.SIGN_IN_ERROR,
        requestData,
        Language.EN,
      );

      expect(response.isSuccessful).toBe(false);
      expect(response.errorMessage).toBeDefined();
      expect(response.request).toEqual(requestData);
    });

    it('should handle sign-in error flow with Thai', () => {
      const requestData = { email: 'invalid@example.com' };
      const response = ResponseOutputWithContent.failWithContent(
        ERROR_CODES.AUTH.SIGN_IN_ERROR,
        requestData,
        Language.TH,
      );

      expect(response.isSuccessful).toBe(false);
      expect(response.errorMessage).toBeDefined();
      expect(response.request).toEqual(requestData);
    });
  });
});
