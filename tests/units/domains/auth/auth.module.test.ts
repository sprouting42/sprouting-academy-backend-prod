/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { describe, expect, it, vi } from 'vitest';

import { AuthModule } from '@/domains/auth/auth.module';

// Mock decorators
vi.mock('@/domains/auth/controller/docs/auth-sign-in-with-otp', () => ({
  ApiDocSignInWithOtpDoc: () => vi.fn(),
}));
vi.mock('@/domains/auth/controller/docs/auth-verify-otp', () => ({
  ApiDocVerifyOtpDoc: () => vi.fn(),
}));
vi.mock('@/domains/auth/controller/docs/auth-refresh-token', () => ({
  ApiDocRefreshTokenDoc: () => vi.fn(),
}));
vi.mock('@/domains/auth/controller/docs/auth-sign-out', () => ({
  ApiDocSignOutDoc: () => vi.fn(),
}));
vi.mock('@/domains/auth/controller/docs/auth-get-me', () => ({
  ApiDocGetMeDoc: () => vi.fn(),
}));

describe('AuthModule', () => {
  it('should be defined', () => {
    expect(AuthModule).toBeDefined();
  });

  it('should have correct metadata', () => {
    const moduleMetadata = Reflect.getMetadata('imports', AuthModule);
    expect(moduleMetadata).toBeDefined();
  });

  it('should import LoggerModule and DatabaseModule', () => {
    const imports = Reflect.getMetadata('imports', AuthModule);
    expect(imports).toBeDefined();
    expect(imports).toHaveLength(2);
  });

  it('should have AuthController', () => {
    const controllers = Reflect.getMetadata('controllers', AuthModule);
    expect(controllers).toBeDefined();
    expect(controllers).toHaveLength(1);
  });

  it('should provide AuthService and AuthRepository', () => {
    const providers = Reflect.getMetadata('providers', AuthModule);
    expect(providers).toBeDefined();
    expect(providers).toHaveLength(2);
  });
});
