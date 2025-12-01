import { describe, expect, it } from 'vitest';

import { ResponseRequest } from '@/common/response/response-request';

import type { TestRequest, TestResponse } from './mocks/response-request.mock';

describe('ResponseRequest', () => {
  describe('constructor', () => {
    it('should create an instance without initialization', () => {
      const response = new ResponseRequest<TestRequest, TestResponse>();

      expect(response).toBeInstanceOf(ResponseRequest);
    });

    it('should create an instance with partial initialization', () => {
      const response = new ResponseRequest<TestRequest, TestResponse>({
        request: { userId: '123', action: 'create' },
      });

      expect(response.request).toEqual({ userId: '123', action: 'create' });
    });

    it('should create an instance with full initialization', () => {
      const response = new ResponseRequest<TestRequest, TestResponse>({
        responseContent: { id: 1, name: 'Test' },
        request: { userId: '123', action: 'create' },
      });

      expect(response.responseContent).toEqual({ id: 1, name: 'Test' });
      expect(response.request).toEqual({ userId: '123', action: 'create' });
    });

    it('should handle undefined initialization', () => {
      const response = new ResponseRequest<TestRequest, TestResponse>(
        undefined,
      );

      expect(response).toBeInstanceOf(ResponseRequest);
      expect(response.request).toBeUndefined();
    });
  });

  describe('static create', () => {
    it('should create instance without data', () => {
      const response = ResponseRequest.create<TestRequest, TestResponse>();

      expect(response).toBeInstanceOf(ResponseRequest);
      expect(response.request).toBeUndefined();
      expect(response.responseContent).toBeUndefined();
    });

    it('should create instance with request only', () => {
      const response = ResponseRequest.create<TestRequest, TestResponse>({
        request: { userId: '456', action: 'update' },
      });

      expect(response.request).toEqual({ userId: '456', action: 'update' });
      expect(response.responseContent).toBeUndefined();
    });

    it('should create instance with responseContent only', () => {
      const response = ResponseRequest.create<TestRequest, TestResponse>({
        responseContent: { id: 2, name: 'Updated' },
      });

      expect(response.responseContent).toEqual({ id: 2, name: 'Updated' });
      expect(response.request).toBeUndefined();
    });

    it('should create instance with both request and responseContent', () => {
      const response = ResponseRequest.create<TestRequest, TestResponse>({
        request: { userId: '789', action: 'delete' },
        responseContent: { id: 3, name: 'Deleted' },
      });

      expect(response.request).toEqual({ userId: '789', action: 'delete' });
      expect(response.responseContent).toEqual({ id: 3, name: 'Deleted' });
    });
  });

  describe('properties', () => {
    it('should have optional request property', () => {
      const response = new ResponseRequest<TestRequest, TestResponse>();

      expect('request' in response).toBe(true);
    });

    it('should inherit responseContent property from ResponseContent', () => {
      const response = new ResponseRequest<TestRequest, TestResponse>({
        responseContent: { id: 1, name: 'Test' },
      });

      expect('responseContent' in response).toBe(true);
      expect(response.responseContent).toBeDefined();
    });
  });

  describe('real-world scenarios', () => {
    interface CreateUserRequest {
      email: string;
      name: string;
      password: string;
    }

    interface UserResponse {
      id: string;
      email: string;
      name: string;
      createdAt: Date;
    }

    it('should handle user creation scenario', () => {
      const request: CreateUserRequest = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed_password',
      };

      const user: UserResponse = {
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date('2025-11-06'),
      };

      const response = ResponseRequest.create<CreateUserRequest, UserResponse>({
        request,
        responseContent: user,
      });

      expect(response.request?.email).toBe('test@example.com');
      expect(response.responseContent?.id).toBe('user_123');
      expect(response.responseContent?.createdAt).toBeInstanceOf(Date);
    });

    interface UpdateProductRequest {
      productId: string;
      price: number;
      stock: number;
    }

    interface ProductResponse {
      id: string;
      price: number;
      stock: number;
      updatedAt: string;
    }

    it('should handle product update scenario', () => {
      const response = ResponseRequest.create<
        UpdateProductRequest,
        ProductResponse
      >({
        request: {
          productId: 'prod_456',
          price: 99.99,
          stock: 50,
        },
        responseContent: {
          id: 'prod_456',
          price: 99.99,
          stock: 50,
          updatedAt: '2025-11-06T10:00:00Z',
        },
      });

      expect(response.request?.productId).toBe('prod_456');
      expect(response.request?.price).toBe(99.99);
      expect(response.responseContent?.stock).toBe(50);
    });

    it('should handle empty response data', () => {
      const response = ResponseRequest.create<TestRequest, void>({
        request: { userId: '999', action: 'ping' },
      });

      expect(response.request?.action).toBe('ping');
      expect(response.responseContent).toBeUndefined();
    });

    it('should handle array response data', () => {
      interface ListRequest {
        page: number;
        limit: number;
      }

      type ListResponse = Array<{ id: number; name: string }>;

      const response = ResponseRequest.create<ListRequest, ListResponse>({
        request: { page: 1, limit: 10 },
        responseContent: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ],
      });

      expect(response.request?.page).toBe(1);
      expect(Array.isArray(response.responseContent)).toBe(true);
      expect(response.responseContent).toHaveLength(2);
    });
  });

  describe('generic type handling', () => {
    it('should work with string request and number response', () => {
      const response = ResponseRequest.create<string, number>({
        request: 'calculate',
        responseContent: 42,
      });

      expect(response.request).toBe('calculate');
      expect(response.responseContent).toBe(42);
    });

    it('should work with complex nested types', () => {
      interface NestedRequest {
        filters: {
          category: string;
          tags: string[];
        };
        sort: {
          field: string;
          order: 'asc' | 'desc';
        };
      }

      interface NestedResponse {
        results: Array<{ id: string; score: number }>;
        metadata: {
          total: number;
          filtered: number;
        };
      }

      const response = ResponseRequest.create<NestedRequest, NestedResponse>({
        request: {
          filters: {
            category: 'electronics',
            tags: ['smartphone', 'android'],
          },
          sort: {
            field: 'price',
            order: 'asc',
          },
        },
        responseContent: {
          results: [
            { id: 'item_1', score: 0.95 },
            { id: 'item_2', score: 0.87 },
          ],
          metadata: {
            total: 100,
            filtered: 2,
          },
        },
      });

      expect(response.request?.filters.category).toBe('electronics');
      expect(response.request?.sort.order).toBe('asc');
      expect(response.responseContent?.results).toHaveLength(2);
      expect(response.responseContent?.metadata.total).toBe(100);
    });
  });

  describe('ApiProperty decorator type functions', () => {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment */
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    /* eslint-disable @typescript-eslint/no-unsafe-call */
    it('should have type metadata for request property', () => {
      const metadata = Reflect.getMetadata(
        'swagger/apiModelProperties',
        ResponseRequest.prototype,
        'request',
      );

      expect(metadata).toBeDefined();
      if (typeof metadata?.type === 'function') {
        const typeResult = metadata.type();
        expect(typeResult).toBeDefined();
      }
    });

    it('should have inherited type metadata for responseContent property', () => {
      const metadata = Reflect.getMetadata(
        'swagger/apiModelPropertiesArray',
        ResponseRequest.prototype,
      );

      expect(metadata).toBeDefined();
    });
    /* eslint-enable @typescript-eslint/no-unsafe-assignment */
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */
    /* eslint-enable @typescript-eslint/no-unsafe-call */
  });
});
