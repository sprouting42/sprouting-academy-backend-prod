import '../mocks/nest-common.mock.ts';
import type { ExecutionContext } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { UserAccount } from '@/infrastructures/database/dto/user-account.dto';
import { UserRole } from '@/infrastructures/database/enums/user-role';

describe('CurrentUser Decorator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(CurrentUser).toBeDefined();
    expect(typeof CurrentUser).toBe('function');
  });

  it('should extract user from request', () => {
    const mockUser: UserAccount = {
      userId: '123',
      email: 'test@example.com',
      role: UserRole.STUDENT,
    };

    const mockRequest = {
      user: mockUser,
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    const result = CurrentUser(undefined, mockContext);

    expect(result).toEqual(mockUser);
  });

  it('should handle different user data', () => {
    const mockUser: UserAccount = {
      userId: '456',
      email: 'admin@example.com',
      role: UserRole.ADMIN,
    };

    const mockRequest = {
      user: mockUser,
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    const result = CurrentUser(undefined, mockContext);

    expect(result).toEqual(mockUser);
  });

  it('should work with data parameter', () => {
    const mockUser: UserAccount = {
      userId: '789',
      email: 'user@example.com',
      role: UserRole.STUDENT,
    };

    const mockRequest = {
      user: mockUser,
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    const result = CurrentUser('someData', mockContext);

    expect(result).toEqual(mockUser);
  });
});
