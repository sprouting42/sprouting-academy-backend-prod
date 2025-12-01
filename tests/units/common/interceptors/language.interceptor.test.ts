/* eslint-disable @typescript-eslint/unbound-method */

import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { LanguageInterceptor } from '@/common/interceptors/language.interceptor';
import { HTTP_HEADER } from '@/constants/http';
import { DEFAULT_LANGUAGE, Language } from '@/enums/language.enum';

interface MockRequest {
  headers: Record<string, string | string[] | number | undefined>;
  language?: Language;
  method: string;
  url: string;
  [key: string]: unknown;
}

describe('LanguageInterceptor', () => {
  let interceptor: LanguageInterceptor;
  let mockCallHandler: CallHandler;
  let mockRequest: MockRequest;

  beforeEach(() => {
    interceptor = new LanguageInterceptor();

    mockRequest = {
      headers: {},
      method: 'GET',
      url: '/api/test',
    };

    mockCallHandler = {
      handle: vi.fn().mockReturnValue(of('test response')),
    };
  });

  const createMockExecutionContext = (
    request: MockRequest,
  ): ExecutionContext => {
    return {
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue(request),
        getResponse: vi.fn(),
        getNext: vi.fn(),
      }),
      getClass: vi.fn(),
      getHandler: vi.fn(),
      getArgs: vi.fn(),
      getArgByIndex: vi.fn(),
      switchToRpc: vi.fn(),
      switchToWs: vi.fn(),
      getType: vi.fn(),
    } as unknown as ExecutionContext;
  };

  describe('intercept', () => {
    it('should create interceptor instance', () => {
      expect(interceptor).toBeDefined();
      expect(interceptor).toBeInstanceOf(LanguageInterceptor);
    });

    it('should set default language when header is missing', () => {
      const mockContext = createMockExecutionContext(mockRequest);

      const result = interceptor.intercept(mockContext, mockCallHandler);

      expect(result).toBeDefined();
      expect(mockRequest.headers[HTTP_HEADER.LANGUAGE]).toBe(DEFAULT_LANGUAGE);
      expect((mockRequest as { language: Language }).language).toBe(
        DEFAULT_LANGUAGE,
      );
      expect(mockCallHandler.handle).toHaveBeenCalled();
    });

    it('should accept valid uppercase English language header', () => {
      mockRequest.headers[HTTP_HEADER.LANGUAGE] = 'EN';
      const mockContext = createMockExecutionContext(mockRequest);

      const result = interceptor.intercept(mockContext, mockCallHandler);

      expect(result).toBeDefined();
      expect(mockRequest.headers[HTTP_HEADER.LANGUAGE]).toBe(Language.EN);
      expect(mockRequest.language).toBe(Language.EN);
      expect(mockCallHandler.handle).toHaveBeenCalled();
    });

    it('should accept valid lowercase English language header and convert to uppercase', () => {
      mockRequest.headers[HTTP_HEADER.LANGUAGE] = 'en';
      const mockContext = createMockExecutionContext(mockRequest);

      const result = interceptor.intercept(mockContext, mockCallHandler);

      expect(result).toBeDefined();
      expect(mockRequest.headers[HTTP_HEADER.LANGUAGE]).toBe(Language.EN);
      expect(mockRequest.language).toBe(Language.EN);
      expect(mockCallHandler.handle).toHaveBeenCalled();
    });

    it('should accept valid uppercase Thai language header', () => {
      mockRequest.headers[HTTP_HEADER.LANGUAGE] = 'TH';
      const mockContext = createMockExecutionContext(mockRequest);

      const result = interceptor.intercept(mockContext, mockCallHandler);

      expect(result).toBeDefined();
      expect(mockRequest.headers[HTTP_HEADER.LANGUAGE]).toBe(Language.TH);
      expect(mockRequest.language).toBe(Language.TH);
      expect(mockCallHandler.handle).toHaveBeenCalled();
    });

    it('should accept valid lowercase Thai language header and convert to uppercase', () => {
      mockRequest.headers[HTTP_HEADER.LANGUAGE] = 'th';
      const mockContext = createMockExecutionContext(mockRequest);

      const result = interceptor.intercept(mockContext, mockCallHandler);

      expect(result).toBeDefined();
      expect(mockRequest.headers[HTTP_HEADER.LANGUAGE]).toBe(Language.TH);
      expect(mockRequest.language).toBe(Language.TH);
      expect(mockCallHandler.handle).toHaveBeenCalled();
    });

    it('should default to EN for invalid language code', () => {
      mockRequest.headers[HTTP_HEADER.LANGUAGE] = 'FR';
      const mockContext = createMockExecutionContext(mockRequest);

      const result = interceptor.intercept(mockContext, mockCallHandler);

      expect(result).toBeDefined();
      expect(mockRequest.headers[HTTP_HEADER.LANGUAGE]).toBe(DEFAULT_LANGUAGE);
      expect(mockRequest.language).toBe(DEFAULT_LANGUAGE);
      expect(mockCallHandler.handle).toHaveBeenCalled();
    });

    it('should default to EN for empty string language header', () => {
      mockRequest.headers[HTTP_HEADER.LANGUAGE] = '';
      const mockContext = createMockExecutionContext(mockRequest);

      const result = interceptor.intercept(mockContext, mockCallHandler);

      expect(result).toBeDefined();
      expect(mockRequest.headers[HTTP_HEADER.LANGUAGE]).toBe(DEFAULT_LANGUAGE);
      expect(mockRequest.language).toBe(DEFAULT_LANGUAGE);
      expect(mockCallHandler.handle).toHaveBeenCalled();
    });

    it('should default to EN for non-string language header (number)', () => {
      mockRequest.headers[HTTP_HEADER.LANGUAGE] = 123;
      const mockContext = createMockExecutionContext(mockRequest);

      const result = interceptor.intercept(mockContext, mockCallHandler);

      expect(result).toBeDefined();
      expect(mockRequest.headers[HTTP_HEADER.LANGUAGE]).toBe(DEFAULT_LANGUAGE);
      expect(mockRequest.language).toBe(DEFAULT_LANGUAGE);
      expect(mockCallHandler.handle).toHaveBeenCalled();
    });

    it('should default to EN for non-string language header (array)', () => {
      mockRequest.headers[HTTP_HEADER.LANGUAGE] = ['EN', 'TH'];
      const mockContext = createMockExecutionContext(mockRequest);

      const result = interceptor.intercept(mockContext, mockCallHandler);

      expect(result).toBeDefined();
      expect(mockRequest.headers[HTTP_HEADER.LANGUAGE]).toBe(DEFAULT_LANGUAGE);
      expect(mockRequest.language).toBe(DEFAULT_LANGUAGE);
      expect(mockCallHandler.handle).toHaveBeenCalled();
    });

    it('should return observable from next.handle()', () => {
      const mockContext = createMockExecutionContext(mockRequest);

      const result = interceptor.intercept(mockContext, mockCallHandler);

      expect(result).toBeDefined();
      result.subscribe(value => {
        expect(value).toBe('test response');
      });
    });

    it('should handle mixed case language header', () => {
      mockRequest.headers[HTTP_HEADER.LANGUAGE] = 'En';
      const mockContext = createMockExecutionContext(mockRequest);

      const result = interceptor.intercept(mockContext, mockCallHandler);

      expect(result).toBeDefined();
      expect(mockRequest.headers[HTTP_HEADER.LANGUAGE]).toBe(Language.EN);
      expect(mockRequest.language).toBe(Language.EN);
    });

    it('should handle mixed case Thai language header', () => {
      mockRequest.headers[HTTP_HEADER.LANGUAGE] = 'Th';
      const mockContext = createMockExecutionContext(mockRequest);

      const result = interceptor.intercept(mockContext, mockCallHandler);

      expect(result).toBeDefined();
      expect(mockRequest.headers[HTTP_HEADER.LANGUAGE]).toBe(Language.TH);
      expect(mockRequest.language).toBe(Language.TH);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle typical API request with English header', () => {
      mockRequest.headers[HTTP_HEADER.LANGUAGE] = 'en';
      mockRequest.method = 'POST';
      mockRequest.url = '/api/v1/auth/sign-in';

      const mockContext = createMockExecutionContext(mockRequest);

      const result = interceptor.intercept(mockContext, mockCallHandler);

      result.subscribe(() => {
        expect(mockRequest.headers[HTTP_HEADER.LANGUAGE]).toBe(Language.EN);
        expect(mockRequest.language).toBe(Language.EN);
        expect(mockCallHandler.handle).toHaveBeenCalled();
      });
    });

    it('should handle typical API request with Thai header', () => {
      mockRequest.headers[HTTP_HEADER.LANGUAGE] = 'th';
      mockRequest.method = 'GET';
      mockRequest.url = '/api/v1/users/profile';

      const mockContext = createMockExecutionContext(mockRequest);

      const result = interceptor.intercept(mockContext, mockCallHandler);

      result.subscribe(() => {
        expect(mockRequest.headers[HTTP_HEADER.LANGUAGE]).toBe(Language.TH);
        expect(mockRequest.language).toBe(Language.TH);
        expect(mockCallHandler.handle).toHaveBeenCalled();
      });
    });

    it('should handle API request without language header', () => {
      mockRequest.method = 'GET';
      mockRequest.url = '/api/v1/public/info';

      const mockContext = createMockExecutionContext(mockRequest);

      const result = interceptor.intercept(mockContext, mockCallHandler);

      result.subscribe(() => {
        expect(mockRequest.headers[HTTP_HEADER.LANGUAGE]).toBe(
          DEFAULT_LANGUAGE,
        );
        expect(mockRequest.language).toBe(DEFAULT_LANGUAGE);
        expect(mockCallHandler.handle).toHaveBeenCalled();
      });
    });

    it('should handle API request with unsupported language and default to EN', () => {
      mockRequest.headers[HTTP_HEADER.LANGUAGE] = 'ja'; // Japanese not supported
      mockRequest.method = 'POST';
      mockRequest.url = '/api/v1/orders';

      const mockContext = createMockExecutionContext(mockRequest);

      const result = interceptor.intercept(mockContext, mockCallHandler);

      result.subscribe(() => {
        expect(mockRequest.headers[HTTP_HEADER.LANGUAGE]).toBe(
          DEFAULT_LANGUAGE,
        );
        expect(mockRequest.language).toBe(DEFAULT_LANGUAGE);
        expect(mockCallHandler.handle).toHaveBeenCalled();
      });
    });
  });
});
