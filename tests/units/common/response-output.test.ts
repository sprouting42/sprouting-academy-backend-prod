import { HttpStatus } from '@nestjs/common';
import { describe, it, expect } from 'vitest';

import { ErrorCode } from '@/common/errors/types/error-code.type';
import {
  ResponseOutput,
  ResponseOutputWithRequest,
  ResponseOutputWithContent,
} from '@/common/response/response-output';

describe('ResponseOutput', () => {
  describe('fail static method', () => {
    it('should create failed ResponseOutput', () => {
      const error = ErrorCode.create({
        code: 'TEST_ERROR',
        message: 'Test error message',
        statusCode: HttpStatus.BAD_REQUEST,
      });

      const response = ResponseOutput.fail(error);

      expect(response.isSuccessful).toBe(false);
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(response.status).toBe('400');
      expect(response.errorMessage).toBe('Test error message');
      expect(response.errorDetails).toEqual({
        message: 'Test error message',
        code: 'TEST_ERROR',
      });
    });

    it('should handle 404 not found error', () => {
      const error = ErrorCode.create({
        code: 'NOT_FOUND',
        message: 'Resource not found',
        statusCode: HttpStatus.NOT_FOUND,
      });

      const response = ResponseOutput.fail(error);

      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(response.isSuccessful).toBe(false);
      expect(response.errorMessage).toBe('Resource not found');
    });

    it('should handle 500 internal server error', () => {
      const error = ErrorCode.create({
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });

      const response = ResponseOutput.fail(error);

      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(response.errorDetails?.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('success static method', () => {
    it('should create successful ResponseOutput with default status code', () => {
      const response = ResponseOutput.success();

      expect(response.isSuccessful).toBe(true);
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.status).toBe('200');
      expect(response.errorMessage).toBeUndefined();
    });

    it('should create successful ResponseOutput with custom status code', () => {
      const response = ResponseOutput.success(HttpStatus.CREATED);

      expect(response.isSuccessful).toBe(true);
      expect(response.statusCode).toBe(HttpStatus.CREATED);
      expect(response.status).toBe('201');
    });

    it('should create successful ResponseOutput with NO_CONTENT status', () => {
      const response = ResponseOutput.success(HttpStatus.NO_CONTENT);

      expect(response.isSuccessful).toBe(true);
      expect(response.statusCode).toBe(HttpStatus.NO_CONTENT);
      expect(response.status).toBe('204');
    });
  });
});

describe('ResponseOutputWithRequest', () => {
  interface TestRequest {
    userId: string;
    action: string;
  }

  describe('failWithRequest static method', () => {
    it('should create failed response with request data', () => {
      const error = ErrorCode.create({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        statusCode: HttpStatus.BAD_REQUEST,
      });

      const request: TestRequest = {
        userId: 'user-123',
        action: 'create',
      };

      const response = ResponseOutputWithRequest.failWithRequest(
        error,
        request,
      );

      expect(response.isSuccessful).toBe(false);
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(response.request).toEqual(request);
      expect(response.type).toBe('ResponseOutputWithRequest');
      expect(response.errorMessage).toBe('Validation failed');
    });

    it('should handle complex request object', () => {
      const error = ErrorCode.create({
        code: 'UNAUTHORIZED',
        message: 'Unauthorized access',
        statusCode: HttpStatus.UNAUTHORIZED,
      });

      const request = {
        userId: 'user-456',
        action: 'delete',
        resourceId: 'resource-789',
        timestamp: new Date().toISOString(),
      };

      const response = ResponseOutputWithRequest.failWithRequest(
        error,
        request,
      );

      expect(response.request).toEqual(request);
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('successWithRequest static method', () => {
    it('should create successful response with request data and default status', () => {
      const request: TestRequest = {
        userId: 'user-123',
        action: 'read',
      };

      const response = ResponseOutputWithRequest.successWithRequest(request);

      expect(response.isSuccessful).toBe(true);
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.request).toEqual(request);
      expect(response.type).toBe('ResponseOutputWithRequest');
    });

    it('should create successful response with request data and custom status', () => {
      const request: TestRequest = {
        userId: 'user-456',
        action: 'create',
      };

      const response = ResponseOutputWithRequest.successWithRequest(
        request,
        HttpStatus.CREATED,
      );

      expect(response.isSuccessful).toBe(true);
      expect(response.statusCode).toBe(HttpStatus.CREATED);
      expect(response.request).toEqual(request);
    });

    it('should handle empty object as request', () => {
      const request = {};

      const response = ResponseOutputWithRequest.successWithRequest(request);

      expect(response.request).toEqual({});
      expect(response.isSuccessful).toBe(true);
    });
  });
});

describe('ResponseOutputWithContent', () => {
  interface TestRequest {
    userId: string;
  }

  interface TestContent {
    id: string;
    name: string;
  }

  describe('failWithContent static method', () => {
    it('should create failed response with request data', () => {
      const error = ErrorCode.create({
        code: 'NOT_FOUND',
        message: 'User not found',
        statusCode: HttpStatus.NOT_FOUND,
      });

      const request: TestRequest = {
        userId: 'user-999',
      };

      const response = ResponseOutputWithContent.failWithContent(
        error,
        request,
      );

      expect(response.isSuccessful).toBe(false);
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(response.request).toEqual(request);
      expect(response.type).toBe('ResponseOutputWithContent');
      expect(response.errorMessage).toBe('User not found');
      expect(response.responseContent).toBeUndefined();
    });

    it('should create failed response with error details', () => {
      const error = ErrorCode.create({
        code: 'SERVER_ERROR',
        message: 'Internal server error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });

      const request = { action: 'process' };

      const response = ResponseOutputWithContent.failWithContent(
        error,
        request,
      );

      expect(response.errorDetails).toEqual({
        message: 'Internal server error',
        code: 'SERVER_ERROR',
      });
    });
  });

  describe('successWithContent static method', () => {
    it('should create successful response with request and content', () => {
      const request: TestRequest = {
        userId: 'user-123',
      };

      const content: TestContent = {
        id: 'user-123',
        name: 'John Doe',
      };

      const response = ResponseOutputWithContent.successWithContent(
        request,
        content,
      );

      expect(response.isSuccessful).toBe(true);
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.request).toEqual(request);
      expect(response.responseContent).toEqual(content);
      expect(response.type).toBe('ResponseOutputWithContent');
    });

    it('should create successful response with custom status code', () => {
      const request: TestRequest = {
        userId: 'user-456',
      };

      const content: TestContent = {
        id: 'user-456',
        name: 'Jane Doe',
      };

      const response = ResponseOutputWithContent.successWithContent(
        request,
        content,
        HttpStatus.CREATED,
      );

      expect(response.isSuccessful).toBe(true);
      expect(response.statusCode).toBe(HttpStatus.CREATED);
      expect(response.responseContent).toEqual(content);
    });

    it('should handle array content', () => {
      const request = { query: 'search' };
      const content: TestContent[] = [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' },
      ];

      const response = ResponseOutputWithContent.successWithContent(
        request,
        content,
      );

      expect(response.responseContent).toEqual(content);
      expect(Array.isArray(response.responseContent)).toBe(true);
    });

    it('should handle null content', () => {
      const request = { userId: 'user-789' };
      const content = null;

      const response = ResponseOutputWithContent.successWithContent(
        request,
        content,
      );

      expect(response.responseContent).toBeNull();
      expect(response.isSuccessful).toBe(true);
    });

    it('should handle undefined content', () => {
      const request = { userId: 'user-101' };
      const content = undefined;

      const response = ResponseOutputWithContent.successWithContent(
        request,
        content,
      );

      expect(response.responseContent).toBeUndefined();
      expect(response.isSuccessful).toBe(true);
    });
  });

  describe('Type Inheritance', () => {
    it('should maintain correct type hierarchy', () => {
      const request = { userId: 'user-123' };
      const content = { id: '1', name: 'Test' };

      const response = ResponseOutputWithContent.successWithContent(
        request,
        content,
      );

      expect(response.type).toBe('ResponseOutputWithContent');
      expect(response).toHaveProperty('request');
      expect(response).toHaveProperty('responseContent');
      expect(response).toHaveProperty('statusCode');
      expect(response).toHaveProperty('isSuccessful');
    });
  });

  describe('Real-world Scenarios', () => {
    it('should create successful GET user response', () => {
      const request = { userId: 'user-123' };
      const user = {
        id: 'user-123',
        name: 'Alice',
        email: 'alice@example.com',
      };

      const response = ResponseOutputWithContent.successWithContent(
        request,
        user,
      );

      expect(response.isSuccessful).toBe(true);
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.responseContent).toEqual(user);
    });

    it('should create successful POST create user response', () => {
      const request = {
        name: 'Bob',
        email: 'bob@example.com',
      };
      const createdUser = {
        id: 'user-new',
        name: 'Bob',
        email: 'bob@example.com',
      };

      const response = ResponseOutputWithContent.successWithContent(
        request,
        createdUser,
        HttpStatus.CREATED,
      );

      expect(response.isSuccessful).toBe(true);
      expect(response.statusCode).toBe(HttpStatus.CREATED);
      expect(response.responseContent?.id).toBe('user-new');
    });

    it('should create failed validation error response', () => {
      const error = ErrorCode.create({
        code: 'VALIDATION_ERROR',
        message: 'Invalid email format',
        statusCode: HttpStatus.BAD_REQUEST,
      });

      const request = {
        email: 'invalid-email',
      };

      const response = ResponseOutputWithContent.failWithContent(
        error,
        request,
      );

      expect(response.isSuccessful).toBe(false);
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(response.request).toEqual(request);
      expect(response.errorMessage).toBe('Invalid email format');
    });

    it('should create successful list response', () => {
      const request = { page: 1, limit: 10 };
      const users = [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' },
        { id: '3', name: 'User 3' },
      ];

      const response = ResponseOutputWithContent.successWithContent(
        request,
        users,
      );

      expect(response.isSuccessful).toBe(true);
      expect(response.responseContent).toHaveLength(3);
    });
  });
});
