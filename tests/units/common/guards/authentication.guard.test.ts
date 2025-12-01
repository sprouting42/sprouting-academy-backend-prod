/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import '../../modules/logger/mocks/logger.mock';

import type { ExecutionContext } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { UserRole } from '@/infrastructures/database/enums/user-role';
import type { ISupabaseManager } from '@/infrastructures/supabase/interfaces/supabase.service.interface';
import type { AppLoggerService } from '@/modules/logger/services/app-logger.service';

describe('AuthenticationGuard', () => {
  let guard: AuthenticationGuard;
  let supabaseManager: ISupabaseManager;
  let reflector: Reflector;
  let logger: AppLoggerService;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    supabaseManager = {
      getUserFromToken: vi.fn(),
    } as unknown as ISupabaseManager;

    reflector = new Reflector();
    logger = {
      error: vi.fn(),
      log: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    } as unknown as AppLoggerService;

    guard = new AuthenticationGuard(supabaseManager, reflector, logger);

    mockContext = {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: vi.fn(() => ({
        getRequest: vi.fn(() => ({
          headers: {},
        })),
      })),
    } as unknown as ExecutionContext;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access to public routes', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(supabaseManager.getUserFromToken).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when no token is provided', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    mockContext.switchToHttp = vi.fn(() => ({
      getRequest: vi.fn(() => ({
        headers: {},
      })),
    })) as any;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      'Access token is required',
    );
  });

  it('should throw UnauthorizedException when token is empty', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    mockContext.switchToHttp = vi.fn(() => ({
      getRequest: vi.fn(() => ({
        headers: {
          authorization: 'Bearer ',
        },
      })),
    })) as any;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException when authorization header has wrong format', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    mockContext.switchToHttp = vi.fn(() => ({
      getRequest: vi.fn(() => ({
        headers: {
          authorization: 'InvalidFormat token123',
        },
      })),
    })) as any;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should authenticate user with valid token', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const mockUser = {
      id: '123',
      email: 'test@example.com',
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      user_metadata: {
        role: UserRole.STUDENT,
      },
    };

    vi.spyOn(supabaseManager, 'getUserFromToken').mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const mockRequest = {
      headers: {
        authorization: 'Bearer valid-token',
      },
      user: undefined,
    };

    mockContext.switchToHttp = vi.fn(() => ({
      getRequest: vi.fn(() => mockRequest),
    })) as any;

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(mockRequest.user).toEqual({
      userId: '123',
      email: 'test@example.com',
      role: UserRole.STUDENT,
    });
  });

  it('should throw UnauthorizedException when token verification fails', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    vi.spyOn(logger, 'error');

    vi.spyOn(supabaseManager, 'getUserFromToken').mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid token' } as any,
    } as any);

    mockContext.switchToHttp = vi.fn(() => ({
      getRequest: vi.fn(() => ({
        headers: {
          authorization: 'Bearer invalid-token',
        },
      })),
    })) as any;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      'Invalid or expired token',
    );
  });

  it('should throw UnauthorizedException when user is null', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    vi.spyOn(logger, 'error');

    vi.spyOn(supabaseManager, 'getUserFromToken').mockResolvedValue({
      data: { user: null },
      error: null,
    } as any);

    mockContext.switchToHttp = vi.fn(() => ({
      getRequest: vi.fn(() => ({
        headers: {
          authorization: 'Bearer token',
        },
      })),
    })) as any;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should handle exception from supabase manager', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    vi.spyOn(supabaseManager, 'getUserFromToken').mockRejectedValue(
      new Error('Network error'),
    );

    mockContext.switchToHttp = vi.fn(() => ({
      getRequest: vi.fn(() => ({
        headers: {
          authorization: 'Bearer token',
        },
      })),
    })) as any;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should extract token from Bearer authorization header', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const mockUser = {
      id: '456',
      email: 'admin@example.com',
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      user_metadata: {
        role: UserRole.ADMIN,
      },
    };

    const getUserFromTokenSpy = vi
      .spyOn(supabaseManager, 'getUserFromToken')
      .mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

    mockContext.switchToHttp = vi.fn(() => ({
      getRequest: vi.fn(() => ({
        headers: {
          authorization: 'Bearer my-secret-token',
        },
      })),
    })) as any;

    await guard.canActivate(mockContext);

    expect(getUserFromTokenSpy).toHaveBeenCalledWith('my-secret-token');
  });

  it('should check public key on handler and class', async () => {
    const getAllAndOverrideSpy = vi
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(true);

    await guard.canActivate(mockContext);

    expect(getAllAndOverrideSpy).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
      mockContext.getHandler(),
      mockContext.getClass(),
    ]);
  });

  it('should attach UserAccount to request', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const mockUser = {
      id: 'user-789',
      email: 'instructor@example.com',
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      user_metadata: {
        role: UserRole.INSTRUCTOR,
      },
    };

    vi.spyOn(supabaseManager, 'getUserFromToken').mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const mockRequest: any = {
      headers: {
        authorization: 'Bearer token',
      },
      user: undefined,
    };

    mockContext.switchToHttp = vi.fn(() => ({
      getRequest: vi.fn(() => mockRequest),
    })) as any;

    await guard.canActivate(mockContext);

    expect(mockRequest.user).toBeDefined();
    expect(mockRequest.user?.userId).toBe('user-789');
    expect(mockRequest.user?.email).toBe('instructor@example.com');
    expect(mockRequest.user?.role).toBe(UserRole.INSTRUCTOR);
  });
});
