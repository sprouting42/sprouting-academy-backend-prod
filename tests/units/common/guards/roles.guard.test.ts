/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { ExecutionContext } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ROLES_KEY } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { UserRole } from '@/infrastructures/database/enums/user-role';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);

    mockContext = {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: vi.fn(() => ({
        getRequest: vi.fn(() => ({
          user: undefined,
        })),
      })),
    } as unknown as ExecutionContext;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when no roles are required', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it('should allow access when required roles array is empty', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it('should throw ForbiddenException when user is not authenticated', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);

    mockContext.switchToHttp = vi.fn(() => ({
      getRequest: vi.fn(() => ({
        user: undefined,
      })),
    })) as any;

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(mockContext)).toThrow(
      'User not authenticated',
    );
  });

  it('should allow access when user has required role', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);

    mockContext.switchToHttp = vi.fn(() => ({
      getRequest: vi.fn(() => ({
        user: {
          userId: '123',
          email: 'admin@example.com',
          role: UserRole.ADMIN,
        },
      })),
    })) as any;

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it('should allow access when user has one of multiple required roles', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
      UserRole.ADMIN,
      UserRole.INSTRUCTOR,
    ]);

    mockContext.switchToHttp = vi.fn(() => ({
      getRequest: vi.fn(() => ({
        user: {
          userId: '123',
          email: 'instructor@example.com',
          role: UserRole.INSTRUCTOR,
        },
      })),
    })) as any;

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it('should throw ForbiddenException when user does not have required role', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);

    mockContext.switchToHttp = vi.fn(() => ({
      getRequest: vi.fn(() => ({
        user: {
          userId: '123',
          email: 'student@example.com',
          role: UserRole.STUDENT,
        },
      })),
    })) as any;

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(mockContext)).toThrow(
      'You do not have permission to access this resource',
    );
  });

  it('should throw ForbiddenException when user role does not match any required roles', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
      UserRole.ADMIN,
      UserRole.INSTRUCTOR,
    ]);

    mockContext.switchToHttp = vi.fn(() => ({
      getRequest: vi.fn(() => ({
        user: {
          userId: '123',
          email: 'student@example.com',
          role: UserRole.STUDENT,
        },
      })),
    })) as any;

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });

  it('should call reflector with correct metadata key and targets', () => {
    const getAllAndOverrideSpy = vi
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([]);

    guard.canActivate(mockContext);

    expect(getAllAndOverrideSpy).toHaveBeenCalledWith(ROLES_KEY, [
      mockContext.getHandler(),
      mockContext.getClass(),
    ]);
  });

  it('should handle all user roles correctly', () => {
    // Test ADMIN
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
    mockContext.switchToHttp = vi.fn(() => ({
      getRequest: vi.fn(() => ({
        user: { userId: '1', email: 'admin@test.com', role: UserRole.ADMIN },
      })),
    })) as any;
    expect(guard.canActivate(mockContext)).toBe(true);

    // Test INSTRUCTOR
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
      UserRole.INSTRUCTOR,
    ]);
    mockContext.switchToHttp = vi.fn(() => ({
      getRequest: vi.fn(() => ({
        user: {
          userId: '2',
          email: 'instructor@test.com',
          role: UserRole.INSTRUCTOR,
        },
      })),
    })) as any;
    expect(guard.canActivate(mockContext)).toBe(true);

    // Test STUDENT
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
      UserRole.STUDENT,
    ]);
    mockContext.switchToHttp = vi.fn(() => ({
      getRequest: vi.fn(() => ({
        user: {
          userId: '3',
          email: 'student@test.com',
          role: UserRole.STUDENT,
        },
      })),
    })) as any;
    expect(guard.canActivate(mockContext)).toBe(true);
  });
});
