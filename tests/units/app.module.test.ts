/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import './modules/logger/mocks/logger.mock';
import './modules/config/mocks/config.module.mock';
import './modules/throttler/mocks/throttler.module.mock';
import './modules/supabase/mocks/supabase.mock';

import { describe, expect, it, vi } from 'vitest';

// Mock API_CONTROLLER_CONFIG to prevent undefined error in decorators
// Must include all configs that might be used by imported modules
vi.mock('@/constants/api-controller', () => ({
  API_CONTROLLER_CONFIG: {
    AUTH: {
      PREFIX: 'auth',
      TAG: 'Authentication',
      ROUTE: {
        POST_SIGN_IN: 'sign-in-with-otp',
        VERIFY_OTP: 'verify-otp',
        SIGN_OUT: 'sign-out',
        REFRESH: 'refresh',
        GET_ME: 'me',
      },
    },
    CART: {
      PREFIX: 'cart',
      TAG: 'Cart',
      ROUTE: {
        GET_CART: '',
        ADD_ITEM: 'items',
        DELETE_ITEM: 'items/:itemId',
      },
    },
    PAYMENT: {
      PREFIX: 'payment',
      TAG: 'Payment',
      ROUTE: {
        BANK_TRANSFER: 'bank-transfer',
        BANK_TRANSFER_BY_ID: ':id',
        BANK_TRANSFER_BY_ENROLLMENT: 'enrollment-course/:enrollmentCourseId',
        BANK_TRANSFER_BY_STATUS: 'status/:status',
      },
    },
    ENROLLMENT: {
      PREFIX: 'enrollment',
      TAG: 'Enrollment',
      ROUTE: {
        CREATE: '',
        GET_BY_ID: ':id',
        GET_MY_ENROLLMENTS: '',
      },
    },
    ORDER: {
      PREFIX: 'order',
      TAG: 'Order',
      ROUTE: {
        CREATE: '',
      },
    },
    HEALTH: {
      PREFIX: '_health',
      TAG: 'System',
      ROUTE: {
        GET_HEALTH: '',
      },
    },
  },
}));

// Mock BaseController to prevent "Class extends value undefined" error
vi.mock('@/common/controllers/base.controller', () => ({
  BaseController: class {
    protected actionResponse<TResponse>(result: TResponse): TResponse {
      return result;
    }
    protected actionResponseError(
      _language: unknown,
      error: unknown,
      _input?: unknown,
    ): { isSuccessful: boolean; error: unknown } {
      return { isSuccessful: false, error };
    }
  },
}));

// Mock AuthService to prevent TOKEN undefined error
vi.mock('@/domains/auth/services/auth.service', () => ({
  AuthService: {
    TOKEN: Symbol('AuthService'),
  },
}));

// Mock AuthRepository to prevent TOKEN undefined error
vi.mock('@/domains/auth/repositories/auth.repository', () => ({
  AuthRepository: {
    TOKEN: Symbol('AuthRepository'),
  },
}));

// Mock WebhookService to prevent TOKEN undefined error
vi.mock('@/modules/webhook/services/webhook.service', () => ({
  WebhookService: {
    TOKEN: Symbol('WebhookService'),
  },
}));

// Mock StorageService to prevent TOKEN undefined error
vi.mock('@/infrastructures/supabase/services/storage.service', () => ({
  StorageService: {
    TOKEN: Symbol('StorageService'),
  },
}));

import { AppModule } from '@/app.module';
import { AuthModule } from '@/domains/auth/auth.module';
import { PaymentModule } from '@/domains/payment/payment.module';
import { SystemModule } from '@/domains/system/system.module';
import { SupabaseModule } from '@/infrastructures/supabase/supabase.module';
import { ConfigModule } from '@/modules/config/config.module';
import { LoggerModule } from '@/modules/logger/logger.module';
import { ThrottlerModule } from '@/modules/throttler/throttler.module';

describe('AppModule', () => {
  it('should be defined', () => {
    expect(AppModule).toBeDefined();
  });

  it('should be a module class', () => {
    expect(typeof AppModule).toBe('function');
  });

  it('should import all core modules', () => {
    const metadata = Reflect.getMetadata('imports', AppModule);
    expect(metadata).toBeDefined();
    expect(Array.isArray(metadata)).toBe(true);
    expect(metadata).toContain(ConfigModule);
    expect(metadata).toContain(LoggerModule);
    expect(metadata).toContain(ThrottlerModule);
    expect(metadata).toContain(SupabaseModule);
  });

  it('should import all domain modules', () => {
    const metadata = Reflect.getMetadata('imports', AppModule);
    expect(metadata).toBeDefined();
    expect(Array.isArray(metadata)).toBe(true);
    expect(metadata).toContain(SystemModule);
    expect(metadata).toContain(AuthModule);
    expect(metadata).toContain(PaymentModule);
  });
});
