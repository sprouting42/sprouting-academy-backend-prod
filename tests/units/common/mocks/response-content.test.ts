import { HttpStatus } from '@nestjs/common';
import { describe, it, expect } from 'vitest';

import { ResponseContent } from '@/common/response/response-content';

interface TestUser {
  id: string;
  name: string;
  email: string;
}

interface TestProduct {
  id: number;
  title: string;
  price: number;
}

describe('ResponseContent', () => {
  describe('Constructor', () => {
    it('should create ResponseContent with typed content', () => {
      const user: TestUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      };

      const response = new ResponseContent<TestUser>({
        correlationId: 'test-123',
        responseDate: '2024-01-01T00:00:00.000Z',
        statusCode: HttpStatus.OK,
        status: '200',
        isSuccessful: true,
        responseContent: user,
      });

      expect(response.responseContent).toEqual(user);
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.isSuccessful).toBe(true);
    });

    it('should create ResponseContent without content', () => {
      const response = new ResponseContent({
        statusCode: HttpStatus.NO_CONTENT,
        status: '204',
        isSuccessful: true,
      });

      expect(response.responseContent).toBeUndefined();
      expect(response.statusCode).toBe(HttpStatus.NO_CONTENT);
    });

    it('should create ResponseContent with error and no content', () => {
      const response = new ResponseContent({
        statusCode: HttpStatus.NOT_FOUND,
        status: '404',
        isSuccessful: false,
        errorMessage: 'User not found',
      });

      expect(response.responseContent).toBeUndefined();
      expect(response.isSuccessful).toBe(false);
      expect(response.errorMessage).toBe('User not found');
    });

    it('should handle array as response content', () => {
      const users: TestUser[] = [
        { id: '1', name: 'John', email: 'john@example.com' },
        { id: '2', name: 'Jane', email: 'jane@example.com' },
      ];

      const response = new ResponseContent<TestUser[]>({
        statusCode: HttpStatus.OK,
        status: '200',
        isSuccessful: true,
        responseContent: users,
      });

      expect(response.responseContent).toEqual(users);
      expect(Array.isArray(response.responseContent)).toBe(true);
      expect(response.responseContent).toHaveLength(2);
    });

    it('should handle empty array as response content', () => {
      const response = new ResponseContent<TestUser[]>({
        statusCode: HttpStatus.OK,
        status: '200',
        isSuccessful: true,
        responseContent: [],
      });

      expect(response.responseContent).toEqual([]);
      expect(Array.isArray(response.responseContent)).toBe(true);
      expect(response.responseContent).toHaveLength(0);
    });
  });

  describe('create static method', () => {
    it('should create ResponseContent using factory method', () => {
      const product: TestProduct = {
        id: 1,
        title: 'Test Product',
        price: 99.99,
      };

      const response = ResponseContent.create<TestProduct>({
        correlationId: 'create-123',
        responseDate: '2024-01-01T00:00:00.000Z',
        statusCode: HttpStatus.OK,
        status: '200',
        isSuccessful: true,
        responseContent: product,
      });

      expect(response).toBeInstanceOf(ResponseContent);
      expect(response.responseContent).toEqual(product);
    });

    it('should create ResponseContent with undefined content', () => {
      const response = ResponseContent.create({
        statusCode: HttpStatus.OK,
        status: '200',
        isSuccessful: true,
      });

      expect(response).toBeInstanceOf(ResponseContent);
      expect(response.responseContent).toBeUndefined();
    });

    it('should create ResponseContent with null content', () => {
      const response = ResponseContent.create({
        statusCode: HttpStatus.OK,
        status: '200',
        isSuccessful: true,
        responseContent: null,
      });

      expect(response).toBeInstanceOf(ResponseContent);
      expect(response.responseContent).toBeNull();
    });
  });

  describe('Type Safety', () => {
    it('should preserve type of string content', () => {
      const response = ResponseContent.create<string>({
        statusCode: HttpStatus.OK,
        status: '200',
        isSuccessful: true,
        responseContent: 'Hello World',
      });

      expect(typeof response.responseContent).toBe('string');
      expect(response.responseContent).toBe('Hello World');
    });

    it('should preserve type of number content', () => {
      const response = ResponseContent.create<number>({
        statusCode: HttpStatus.OK,
        status: '200',
        isSuccessful: true,
        responseContent: 42,
      });

      expect(typeof response.responseContent).toBe('number');
      expect(response.responseContent).toBe(42);
    });

    it('should preserve type of boolean content', () => {
      const response = ResponseContent.create<boolean>({
        statusCode: HttpStatus.OK,
        status: '200',
        isSuccessful: true,
        responseContent: true,
      });

      expect(typeof response.responseContent).toBe('boolean');
      expect(response.responseContent).toBe(true);
    });

    it('should preserve type of object content', () => {
      const user: TestUser = {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
      };

      const response = ResponseContent.create<TestUser>({
        statusCode: HttpStatus.OK,
        status: '200',
        isSuccessful: true,
        responseContent: user,
      });

      expect(typeof response.responseContent).toBe('object');
      expect(response.responseContent).toHaveProperty('id');
      expect(response.responseContent).toHaveProperty('name');
      expect(response.responseContent).toHaveProperty('email');
    });
  });

  describe('Inheritance from Response', () => {
    it('should inherit all Response properties', () => {
      const response = ResponseContent.create<TestUser>({
        correlationId: 'test-correlation',
        responseDate: '2024-01-01T00:00:00.000Z',
        statusCode: HttpStatus.OK,
        status: '200',
        isSuccessful: true,
        responseContent: {
          id: '1',
          name: 'John',
          email: 'john@example.com',
        },
      });

      expect(response.correlationId).toBe('test-correlation');
      expect(response.responseDate).toBe('2024-01-01T00:00:00.000Z');
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.status).toBe('200');
      expect(response.isSuccessful).toBe(true);
    });

    it('should inherit error handling from Response', () => {
      const response = ResponseContent.create({
        correlationId: 'error-123',
        responseDate: '2024-01-01T00:00:00.000Z',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: '500',
        isSuccessful: false,
        errorMessage: 'Server error',
        errorDetails: {
          message: 'Internal server error',
          code: 'SERVER_ERROR',
        },
      });

      expect(response.errorMessage).toBe('Server error');
      expect(response.errorDetails).toEqual({
        message: 'Internal server error',
        code: 'SERVER_ERROR',
      });
    });
  });

  describe('Real-world API Responses', () => {
    it('should create successful GET user response', () => {
      const user: TestUser = {
        id: 'user-123',
        name: 'Alice Johnson',
        email: 'alice@example.com',
      };

      const response = ResponseContent.create<TestUser>({
        correlationId: 'get-user-456',
        responseDate: new Date().toISOString(),
        statusCode: HttpStatus.OK,
        status: '200',
        isSuccessful: true,
        responseContent: user,
      });

      expect(response.isSuccessful).toBe(true);
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.responseContent).toEqual(user);
    });

    it('should create successful GET users list response', () => {
      const users: TestUser[] = [
        { id: '1', name: 'User 1', email: 'user1@example.com' },
        { id: '2', name: 'User 2', email: 'user2@example.com' },
        { id: '3', name: 'User 3', email: 'user3@example.com' },
      ];

      const response = ResponseContent.create<TestUser[]>({
        correlationId: 'get-users-789',
        responseDate: new Date().toISOString(),
        statusCode: HttpStatus.OK,
        status: '200',
        isSuccessful: true,
        responseContent: users,
      });

      expect(response.isSuccessful).toBe(true);
      expect(response.responseContent).toHaveLength(3);
    });

    it('should create successful POST create user response', () => {
      const newUser: TestUser = {
        id: 'new-user-001',
        name: 'New User',
        email: 'new@example.com',
      };

      const response = ResponseContent.create<TestUser>({
        correlationId: 'create-user-101',
        responseDate: new Date().toISOString(),
        statusCode: HttpStatus.CREATED,
        status: '201',
        isSuccessful: true,
        responseContent: newUser,
      });

      expect(response.isSuccessful).toBe(true);
      expect(response.statusCode).toBe(HttpStatus.CREATED);
      expect(response.responseContent).toEqual(newUser);
    });

    it('should create successful DELETE response with no content', () => {
      const response = ResponseContent.create({
        correlationId: 'delete-user-202',
        responseDate: new Date().toISOString(),
        statusCode: HttpStatus.NO_CONTENT,
        status: '204',
        isSuccessful: true,
      });

      expect(response.isSuccessful).toBe(true);
      expect(response.statusCode).toBe(HttpStatus.NO_CONTENT);
      expect(response.responseContent).toBeUndefined();
    });

    it('should create successful PUT update user response', () => {
      const updatedUser: TestUser = {
        id: 'user-123',
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      const response = ResponseContent.create<TestUser>({
        correlationId: 'update-user-303',
        responseDate: new Date().toISOString(),
        statusCode: HttpStatus.OK,
        status: '200',
        isSuccessful: true,
        responseContent: updatedUser,
      });

      expect(response.isSuccessful).toBe(true);
      expect(response.responseContent).toEqual(updatedUser);
    });

    it('should create 404 not found response', () => {
      const response = ResponseContent.create({
        correlationId: 'get-user-404',
        responseDate: new Date().toISOString(),
        statusCode: HttpStatus.NOT_FOUND,
        status: '404',
        isSuccessful: false,
        errorMessage: 'User not found',
        errorDetails: {
          message: 'User with ID user-999 does not exist',
          code: 'USER_NOT_FOUND',
        },
      });

      expect(response.isSuccessful).toBe(false);
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(response.responseContent).toBeUndefined();
    });

    it('should create validation error response', () => {
      const response = ResponseContent.create({
        correlationId: 'validation-error-505',
        responseDate: new Date().toISOString(),
        statusCode: HttpStatus.BAD_REQUEST,
        status: '400',
        isSuccessful: false,
        errorMessage: 'Validation failed',
        errorDetails: {
          message: 'Request validation failed',
          code: 'VALIDATION_ERROR',
          validationErrors: {
            email: ['Email is required', 'Email must be valid'],
            name: ['Name must not be empty'],
          },
        },
      });

      expect(response.isSuccessful).toBe(false);
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(response.errorDetails).toHaveProperty('validationErrors');
    });
  });

  describe('Pagination Response', () => {
    interface PaginatedResponse<T> {
      data: T[];
      total: number;
      page: number;
      pageSize: number;
    }

    it('should create paginated list response', () => {
      const paginatedUsers: PaginatedResponse<TestUser> = {
        data: [
          { id: '1', name: 'User 1', email: 'user1@example.com' },
          { id: '2', name: 'User 2', email: 'user2@example.com' },
        ],
        total: 100,
        page: 1,
        pageSize: 2,
      };

      const response = ResponseContent.create<PaginatedResponse<TestUser>>({
        correlationId: 'paginated-users-606',
        responseDate: new Date().toISOString(),
        statusCode: HttpStatus.OK,
        status: '200',
        isSuccessful: true,
        responseContent: paginatedUsers,
      });

      expect(response.isSuccessful).toBe(true);
      expect(response.responseContent?.data).toHaveLength(2);
      expect(response.responseContent?.total).toBe(100);
      expect(response.responseContent?.page).toBe(1);
    });
  });

  describe('Nested Objects', () => {
    interface UserWithAddress {
      id: string;
      name: string;
      address: {
        street: string;
        city: string;
        country: string;
      };
    }

    it('should handle nested object structures', () => {
      const userWithAddress: UserWithAddress = {
        id: 'user-nested-1',
        name: 'Nested User',
        address: {
          street: '123 Main St',
          city: 'New York',
          country: 'USA',
        },
      };

      const response = ResponseContent.create<UserWithAddress>({
        statusCode: HttpStatus.OK,
        status: '200',
        isSuccessful: true,
        responseContent: userWithAddress,
      });

      expect(response.responseContent?.address).toEqual({
        street: '123 Main St',
        city: 'New York',
        country: 'USA',
      });
    });
  });
});
