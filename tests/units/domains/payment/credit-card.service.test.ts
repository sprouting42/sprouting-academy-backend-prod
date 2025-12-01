import { describe, it, expect, beforeEach, vi } from 'vitest';

import type { IPaymentRepository } from '@/domains/payment/repositories/interfaces/payment.repository.interface';
import { CreditCardService } from '@/domains/payment/services/credit-card.service';
import { PaymentStatus } from '@/enums/payment-status.enum';
import type { PaymentDto } from '@/infrastructures/database/dto/payment.dto';
import type { AppLoggerService } from '@/modules/logger/services/app-logger.service';
import type { IOmiseService } from '@/modules/omise/services/interfaces/omise.service.interface';

// Mock PaymentRepository to prevent undefined TOKEN error
vi.mock('@/infrastructures/database/repositories/payment.repository', () => ({
  PaymentRepository: {
    TOKEN: Symbol('PaymentRepository'),
  },
}));

// Mock ERROR_CODES to prevent undefined error in error handling
vi.mock('@/common/errors/error-code', async () => {
  const actual = await vi.importActual('@/common/errors/error-code');
  return {
    ...actual,
    ERROR_CODES: {
      PAYMENT: {},
    },
  };
});

describe('CreditCardService', () => {
  let creditCardService: CreditCardService;
  let mockLogger: Partial<AppLoggerService>;
  let mockOmiseService: Partial<IOmiseService>;
  let mockPaymentRepository: Partial<IPaymentRepository>;

  const mockPayment: PaymentDto = {
    id: 'payment-123',
    paymentType: 'Credit Card',
    status: 'successful',
    omiseChargeId: 'chrg_test_123',
    orderId: 'order-123',
    slipImage: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockOmiseCharge = {
    id: 'chrg_test_123',
    amount: 100000,
    currency: 'THB',
    paid: true,
    failure_code: undefined,
    failure_message: undefined,
  };

  beforeEach(() => {
    mockLogger = {
      debug: vi.fn(),
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    mockOmiseService = {
      createCharge: vi.fn(),
      retrieveCharge: vi.fn(),
    };

    mockPaymentRepository = {
      createPayment: vi.fn(),
      findByOmiseChargeId: vi.fn(),
      updatePaymentStatus: vi.fn(),
    };

    creditCardService = new CreditCardService(
      mockLogger as AppLoggerService,
      mockOmiseService as IOmiseService,
      mockPaymentRepository as IPaymentRepository,
    );
  });

  describe('createCharge', () => {
    it('should create charge successfully', async () => {
      const input = {
        amount: 100000,
        token: 'tokn_test_123',
        description: 'Test payment',
        orderId: 'order-123',
      };

      vi.spyOn(mockOmiseService, 'createCharge').mockResolvedValue(
        mockOmiseCharge,
      );
      vi.spyOn(mockPaymentRepository, 'createPayment').mockResolvedValue(
        mockPayment,
      );

      const result = await creditCardService.createCharge(input);

      expect(result.paymentId).toBe('payment-123');
      expect(result.omiseChargeId).toBe('chrg_test_123');
      expect(result.status).toBe(PaymentStatus.SUCCESSFUL);
      expect(result.amount).toBe(100000);
    });

    it('should handle failed charge', async () => {
      const failedCharge = {
        ...mockOmiseCharge,
        paid: false,
        failure_code: 'insufficient_fund',
      };

      vi.spyOn(mockOmiseService, 'createCharge').mockResolvedValue(
        failedCharge,
      );
      vi.spyOn(mockPaymentRepository, 'createPayment').mockResolvedValue({
        ...mockPayment,
        status: 'failed',
      });

      const result = await creditCardService.createCharge({
        amount: 100000,
        token: 'tokn_test_123',
        description: 'Test',
        orderId: 'order-123',
      });

      expect(result.status).toBe(PaymentStatus.FAILED);
    });

    it('should handle pending charge', async () => {
      const pendingCharge = {
        ...mockOmiseCharge,
        paid: false,
        failure_code: undefined,
      };

      vi.spyOn(mockOmiseService, 'createCharge').mockResolvedValue(
        pendingCharge,
      );
      vi.spyOn(mockPaymentRepository, 'createPayment').mockResolvedValue({
        ...mockPayment,
        status: 'pending',
      });

      const result = await creditCardService.createCharge({
        amount: 100000,
        token: 'tokn_test_123',
        description: 'Test',
        orderId: 'order-123',
      });

      expect(result.status).toBe(PaymentStatus.PENDING);
    });
  });

  describe('retrieveCharge', () => {
    it('should retrieve charge successfully', async () => {
      vi.spyOn(mockOmiseService, 'retrieveCharge').mockResolvedValue(
        mockOmiseCharge,
      );

      const result = await creditCardService.retrieveCharge({
        chargeId: 'chrg_test_123',
      });

      expect(result.isSuccessful).toBe(true);
      expect(result.responseContent?.omiseChargeId).toBe('chrg_test_123');
      expect(result.responseContent?.status).toBe(PaymentStatus.SUCCESSFUL);
    });

    it('should handle retrieve errors', async () => {
      vi.spyOn(mockOmiseService, 'retrieveCharge').mockRejectedValue(
        new Error('Charge not found'),
      );

      const result = await creditCardService.retrieveCharge({
        chargeId: 'invalid',
      });

      expect(result.isSuccessful).toBe(false);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('TOKEN', () => {
    it('should have a unique TOKEN symbol', () => {
      expect(CreditCardService.TOKEN).toBeTypeOf('symbol');
      expect(CreditCardService.TOKEN.toString()).toBe(
        'Symbol(CreditCardService)',
      );
    });
  });
});
