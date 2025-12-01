/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { describe, expect, it, vi } from 'vitest';

// Mock API_CONTROLLER_CONFIG to prevent undefined error in decorators
// Must include all configs that might be used by imported modules
vi.mock('@/constants/api-controller', () => ({
  API_CONTROLLER_CONFIG: {
    ORDER: {
      PREFIX: 'order',
      TAG: 'Order',
      ROUTE: {
        CREATE: '',
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

// Mock OrderRepository to prevent undefined TOKEN error
vi.mock('@/domains/order/repositories/order.repository', () => ({
  OrderRepository: {
    TOKEN: Symbol('OrderRepository'),
  },
}));

// Mock OrderService to prevent undefined TOKEN error
vi.mock('@/domains/order/services/order.service', () => ({
  OrderService: {
    TOKEN: Symbol('OrderService'),
  },
}));

// Mock EnrollmentRepository to prevent undefined TOKEN error (imported via PaymentModule)
vi.mock('@/domains/enrollment/repositories/enrollment.repository', () => ({
  EnrollmentRepository: {
    TOKEN: Symbol('EnrollmentRepository'),
  },
}));

// Mock EnrollmentService to prevent undefined TOKEN error (imported via PaymentModule)
vi.mock('@/domains/enrollment/services/enrollment.service', () => ({
  EnrollmentService: {
    TOKEN: Symbol('EnrollmentService'),
  },
}));

// Mock PaymentService to prevent undefined TOKEN error (imported via PaymentModule)
vi.mock('@/domains/payment/services/payment.service', () => ({
  PaymentService: {
    TOKEN: Symbol('PaymentService'),
  },
}));

// Mock StorageService to prevent undefined TOKEN error (imported via SupabaseModule)
vi.mock('@/infrastructures/supabase/services/storage.service', () => ({
  StorageService: {
    TOKEN: Symbol('StorageService'),
  },
}));

// Mock SupabaseManager to prevent undefined TOKEN error (imported via SupabaseModule)
vi.mock('@/infrastructures/supabase/services/supabase.manager', () => ({
  SupabaseManager: {
    TOKEN: Symbol('SupabaseManager'),
  },
}));

// Mock SupabaseConnector to prevent undefined TOKEN error (imported via SupabaseModule)
vi.mock('@/infrastructures/supabase/services/supabase-connector', () => ({
  SupabaseConnector: {
    TOKEN: Symbol('SupabaseConnector'),
  },
}));

import { OrderModule } from '@/domains/order/order.module';

describe('OrderModule', () => {
  it('should be defined', () => {
    expect(OrderModule).toBeDefined();
  });

  it('should have correct metadata', () => {
    const moduleMetadata = Reflect.getMetadata('imports', OrderModule);
    expect(moduleMetadata).toBeDefined();
  });

  it('should import required modules', () => {
    const imports = Reflect.getMetadata('imports', OrderModule) as unknown[];
    expect(imports).toBeDefined();
    // LoggerModule, DatabaseModule, PaymentModule (forwardRef)
    expect(imports.length).toBeGreaterThanOrEqual(2);
  });

  it('should have OrderController', () => {
    const controllers = Reflect.getMetadata(
      'controllers',
      OrderModule,
    ) as unknown[];
    expect(controllers).toBeDefined();
    expect(controllers).toHaveLength(1);
  });

  it('should provide OrderService and OrderRepository', () => {
    const providers = Reflect.getMetadata(
      'providers',
      OrderModule,
    ) as unknown[];
    expect(providers).toBeDefined();
    expect(providers).toHaveLength(2);
  });

  it('should export OrderService and OrderRepository', () => {
    const exports = Reflect.getMetadata('exports', OrderModule) as unknown[];
    expect(exports).toBeDefined();
    expect(exports).toHaveLength(2);
  });
});
