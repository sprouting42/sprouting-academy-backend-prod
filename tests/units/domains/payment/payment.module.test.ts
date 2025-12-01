/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { describe, expect, it, vi } from 'vitest';

// Mock API_CONTROLLER_CONFIG to prevent undefined error in decorators
// Must include all configs that might be used by imported modules
vi.mock('@/constants/api-controller', () => ({
  API_CONTROLLER_CONFIG: {
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
  },
}));

// Mock PaymentValidationService to prevent undefined TOKEN error
vi.mock('@/domains/payment/services/payment-validation.service', () => ({
  PaymentValidationService: {
    TOKEN: Symbol('PaymentValidationService'),
  },
}));

// Mock CreditCardService to prevent undefined TOKEN error
vi.mock('@/domains/payment/services/credit-card.service', () => ({
  CreditCardService: {
    TOKEN: Symbol('CreditCardService'),
  },
}));

// Mock BankTransferService to prevent undefined TOKEN error
vi.mock('@/domains/payment/services/bank-transfer.service', () => ({
  BankTransferService: {
    TOKEN: Symbol('BankTransferService'),
  },
}));

import { PaymentModule } from '@/domains/payment/payment.module';

describe('PaymentModule', () => {
  it('should be defined', () => {
    expect(PaymentModule).toBeDefined();
  });

  it('should have correct metadata', () => {
    const moduleMetadata = Reflect.getMetadata('imports', PaymentModule);
    expect(moduleMetadata).toBeDefined();
  });

  it('should import required modules', () => {
    const imports = Reflect.getMetadata('imports', PaymentModule) as unknown[];
    expect(imports).toBeDefined();
    // LoggerModule, OmiseModule, DatabaseModule, SupabaseModule, EnrollmentModule, OrderModule (forwardRef)
    expect(imports.length).toBeGreaterThanOrEqual(5);
  });

  it('should have PaymentController', () => {
    const controllers = Reflect.getMetadata(
      'controllers',
      PaymentModule,
    ) as unknown[];
    expect(controllers).toBeDefined();
    expect(controllers).toHaveLength(1);
  });

  it('should provide all payment services and repositories', () => {
    const providers = Reflect.getMetadata(
      'providers',
      PaymentModule,
    ) as unknown[];
    expect(providers).toBeDefined();
    // PaymentRepository, CreditCardService, PaymentValidationService, BankTransferService, PaymentService
    expect(providers).toHaveLength(5);
  });

  it('should export payment services and repositories', () => {
    const exports = Reflect.getMetadata('exports', PaymentModule) as unknown[];
    expect(exports).toBeDefined();
    // PaymentService.TOKEN, PaymentRepository.TOKEN, BankTransferService.TOKEN, CreditCardService.TOKEN, PaymentValidationService.TOKEN
    expect(exports).toHaveLength(5);
  });
});
