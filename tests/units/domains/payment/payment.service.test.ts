/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { BadRequestException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock ERROR_CODES to prevent undefined error in error handling
vi.mock('@/common/errors/error-code', async () => {
  const actual = await vi.importActual('@/common/errors/error-code');
  const actualErrorCodes = (actual as { ERROR_CODES: unknown }).ERROR_CODES as {
    PAYMENT?: Record<
      string,
      { code: string; message: unknown; statusCode: number }
    >;
    [key: string]: unknown;
  };
  return {
    ...actual,
    ERROR_CODES: {
      ...actualErrorCodes,
      PAYMENT: {
        ...actualErrorCodes.PAYMENT,
        CREATE_TOKEN_ERROR: {
          code: 'PAYMENT.CREATE_TOKEN_ERROR',
          message: 'Failed to create token',
          statusCode: 500,
        },
        INVALID_CARD: {
          code: 'PAYMENT.INVALID_CARD',
          message: 'Invalid card',
          statusCode: 400,
        },
        EXPIRED_CARD: {
          code: 'PAYMENT.EXPIRED_CARD',
          message: 'Expired card',
          statusCode: 400,
        },
        INSUFFICIENT_FUND: {
          code: 'PAYMENT.INSUFFICIENT_FUND',
          message: 'Insufficient fund',
          statusCode: 400,
        },
        CREATE_CHARGE_ERROR: {
          code: 'PAYMENT.CREATE_CHARGE_ERROR',
          message: 'Failed to create charge',
          statusCode: 500,
        },
        BANK_TRANSFER_CREATE_ERROR: {
          code: 'PAYMENT.BANK_TRANSFER_CREATE_ERROR',
          message: 'Failed to create bank transfer payment',
          statusCode: 500,
        },
      },
    },
  };
});

import { ERROR_CODES } from '@/common/errors/error-code';
import type { IPaymentRepository } from '@/domains/payment/repositories/interfaces/payment.repository.interface';
import type { BankTransferService } from '@/domains/payment/services/bank-transfer.service';
import type { CreditCardService } from '@/domains/payment/services/credit-card.service';
import type { CreateChargeInput } from '@/domains/payment/services/dto/create-charge.input';
import type { PaymentValidationService } from '@/domains/payment/services/payment-validation.service';
import { PaymentService } from '@/domains/payment/services/payment.service';
import { PaymentStatus } from '@/enums/payment-status.enum';
import type { AppLoggerService } from '@/modules/logger/services/app-logger.service';
import type { IOmiseService } from '@/modules/omise/services/interfaces/omise.service.interface';
import type { WebhookService } from '@/modules/webhook/services/webhook.service';

// Mock SupabaseConnector to prevent undefined TOKEN error
vi.mock('@/infrastructures/supabase/services/supabase-connector', () => ({
  SupabaseConnector: {
    TOKEN: Symbol('SupabaseConnector'),
  },
}));

// Mock StorageService to prevent undefined TOKEN error
vi.mock('@/infrastructures/supabase/services/storage.service', () => ({
  StorageService: {
    TOKEN: Symbol('StorageService'),
  },
}));

describe('PaymentService', () => {
  let paymentService: PaymentService;
  let mockLogger: Partial<AppLoggerService>;
  let mockCreditCardService: Partial<CreditCardService>;
  let mockPaymentValidationService: Partial<PaymentValidationService>;
  let mockBankTransferService: Partial<BankTransferService>;
  let mockPaymentRepository: Partial<IPaymentRepository>;
  let mockOmiseService: Partial<IOmiseService>;

  beforeEach(() => {
    mockLogger = {
      debug: vi.fn(),
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    mockCreditCardService = {
      createCharge: vi.fn(),
      retrieveCharge: vi.fn(),
    };

    mockPaymentValidationService = {
      validateAndPreparePayment: vi.fn(),
    };

    mockBankTransferService = {
      uploadPaymentSlip: vi.fn(),
    };

    mockPaymentRepository = {
      findOneById: vi.fn(),
      createPayment: vi.fn(),
      findMany: vi.fn(),
      findByUserId: vi.fn(),
      createOrUpdateEnrollment: vi.fn(),
      updateOrderStatus: vi.fn(),
      findOrderById: vi.fn(),
      findOrderItemsByOrderId: vi.fn(),
      findCoursesByIds: vi.fn(),
    };

    mockOmiseService = {
      createToken: vi.fn(),
    };

    const mockWebhookService = {
      sendBankTransferCreated: vi.fn().mockResolvedValue(undefined),
    } as Partial<WebhookService>;

    paymentService = new PaymentService(
      mockLogger as AppLoggerService,
      mockCreditCardService as CreditCardService,
      mockPaymentValidationService as PaymentValidationService,
      mockBankTransferService as BankTransferService,
      mockPaymentRepository as IPaymentRepository,
      mockOmiseService as IOmiseService,
      mockWebhookService as WebhookService,
    );
  });

  describe('createCharge', () => {
    const mockInput: CreateChargeInput = {
      userId: 'user-123',
      orderId: 'order-123',
      cardNumber: '4242424242424242',
      cardName: 'John Doe',
      expirationMonth: 12,
      expirationYear: 2025,
      securityCode: '123',
      city: 'Bangkok',
      postalCode: '10110',
    };

    const mockOrder = {
      id: 'order-123',
      totalAmount: 100000,
      userId: 'user-123',
      couponId: null,
    };

    const mockOrderItems = [{ id: 'item-1', courseId: 'course-1' }];

    it('should create charge successfully', async () => {
      vi.spyOn(
        mockPaymentValidationService,
        'validateAndPreparePayment',
      ).mockResolvedValue({
        isValid: true,
        order: mockOrder,
        orderItems: mockOrderItems,
        finalAmount: 100000,
      } as any);

      vi.spyOn(mockOmiseService, 'createToken').mockResolvedValue({
        id: 'tok_test_123',
      } as any);

      vi.spyOn(mockCreditCardService, 'createCharge').mockResolvedValue({
        status: PaymentStatus.SUCCESSFUL,
        paymentId: 'pay_123',
        omiseChargeId: 'chrg_test_123',
        amount: 100000,
        currency: 'THB',
      } as any);

      vi.spyOn(mockPaymentRepository, 'findOneById').mockResolvedValue({
        id: 'pay_123',
        status: PaymentStatus.SUCCESSFUL,
        paymentType: 'Credit Card',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await paymentService.createCharge(mockInput);

      expect(result.isSuccessful).toBe(true);
      expect(result.responseContent?.id).toBe('pay_123');
      expect(mockPaymentRepository.updateOrderStatus).toHaveBeenCalledWith(
        'order-123',
        'successful',
      );
      expect(mockPaymentRepository.createOrUpdateEnrollment).toHaveBeenCalled();
    });

    it('should fail when validation fails', async () => {
      vi.spyOn(
        mockPaymentValidationService,
        'validateAndPreparePayment',
      ).mockResolvedValue({
        isValid: false,
        errorResponse: { isSuccessful: false } as any,
      });

      const result = await paymentService.createCharge(mockInput);

      expect(result.isSuccessful).toBe(false);
    });

    it('should handle token creation errors', async () => {
      vi.spyOn(
        mockPaymentValidationService,
        'validateAndPreparePayment',
      ).mockResolvedValue({
        isValid: true,
        order: mockOrder,
        orderItems: mockOrderItems,
        finalAmount: 100000,
      } as any);

      vi.spyOn(mockOmiseService, 'createToken').mockRejectedValue(
        new Error('Token error'),
      );

      const result = await paymentService.createCharge(mockInput);

      expect(result.isSuccessful).toBe(false);
      expect(result.errorDetails?.code).toBe(
        ERROR_CODES.PAYMENT.CREATE_TOKEN_ERROR.code,
      );
    });

    it('should map invalid card error', async () => {
      vi.spyOn(
        mockPaymentValidationService,
        'validateAndPreparePayment',
      ).mockResolvedValue({
        isValid: true,
        order: mockOrder,
        orderItems: mockOrderItems,
        finalAmount: 100000,
      } as any);

      vi.spyOn(mockOmiseService, 'createToken').mockRejectedValue(
        new BadRequestException('invalid card'),
      );

      const result = await paymentService.createCharge(mockInput);

      expect(result.isSuccessful).toBe(false);
      expect(result.errorDetails?.code).toBe(
        ERROR_CODES.PAYMENT.INVALID_CARD.code,
      );
    });

    it('should map expired card error', async () => {
      vi.spyOn(
        mockPaymentValidationService,
        'validateAndPreparePayment',
      ).mockResolvedValue({
        isValid: true,
        order: mockOrder,
        orderItems: mockOrderItems,
        finalAmount: 100000,
      } as any);

      vi.spyOn(mockOmiseService, 'createToken').mockRejectedValue(
        new BadRequestException('expired'),
      );

      const result = await paymentService.createCharge(mockInput);

      expect(result.isSuccessful).toBe(false);
      expect(result.errorDetails?.code).toBe(
        ERROR_CODES.PAYMENT.EXPIRED_CARD.code,
      );
    });

    it('should map insufficient fund error', async () => {
      vi.spyOn(
        mockPaymentValidationService,
        'validateAndPreparePayment',
      ).mockResolvedValue({
        isValid: true,
        order: mockOrder,
        orderItems: mockOrderItems,
        finalAmount: 100000,
      } as any);

      vi.spyOn(mockOmiseService, 'createToken').mockRejectedValue(
        new BadRequestException('insufficient funds'),
      );

      const result = await paymentService.createCharge(mockInput);

      expect(result.isSuccessful).toBe(false);
      expect(result.errorDetails?.code).toBe(
        ERROR_CODES.PAYMENT.INSUFFICIENT_FUND.code,
      );
    });

    it('should handle charge creation errors', async () => {
      vi.spyOn(
        mockPaymentValidationService,
        'validateAndPreparePayment',
      ).mockResolvedValue({
        isValid: true,
        order: mockOrder,
        orderItems: mockOrderItems,
        finalAmount: 100000,
      } as any);

      vi.spyOn(mockOmiseService, 'createToken').mockResolvedValue({
        id: 'tok_test_123',
      } as any);

      vi.spyOn(mockCreditCardService, 'createCharge').mockRejectedValue(
        new Error('Charge error'),
      );

      const result = await paymentService.createCharge(mockInput);

      expect(result.isSuccessful).toBe(false);
      expect(result.errorDetails?.code).toBe(
        ERROR_CODES.PAYMENT.CREATE_CHARGE_ERROR.code,
      );
    });
  });

  describe('retrieveCharge', () => {
    it('should delegate to credit card service', async () => {
      vi.spyOn(mockCreditCardService, 'retrieveCharge').mockResolvedValue(
        {} as any,
      );

      await paymentService.retrieveCharge({
        chargeId: 'chrg_123',
      });

      expect(mockCreditCardService.retrieveCharge).toHaveBeenCalledWith({
        chargeId: 'chrg_123',
      });
    });
  });

  describe('createBankTransferPayment', () => {
    it('should create bank transfer payment successfully', async () => {
      vi.spyOn(
        mockPaymentValidationService,
        'validateAndPreparePayment',
      ).mockResolvedValue({
        isValid: true,
        order: {
          id: 'order-123',
          totalAmount: 100000,
          userId: 'user-123',
          couponId: null,
        },
        orderItems: [{ id: 'item-1', courseId: 'course-1' }],
        finalAmount: 100000,
      } as any);

      vi.spyOn(mockBankTransferService, 'uploadPaymentSlip').mockResolvedValue({
        url: 'https://example.com/slip.jpg',
        filename: 'slip.jpg',
      });

      vi.spyOn(mockPaymentRepository, 'createPayment').mockResolvedValue({
        id: 'pay_123',
        status: PaymentStatus.PENDING,
        slipImage: 'https://example.com/slip.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      vi.spyOn(mockPaymentRepository, 'findCoursesByIds').mockResolvedValue([
        { id: 'course-1', title: 'Test Course' },
      ] as any);

      const result = await paymentService.createBankTransferPayment({} as any, {
        userId: 'user-123',
        orderId: 'order-123',
        slipUrl: '',
      });

      expect(result.isSuccessful).toBe(true);
      // Enrollments should NOT be created during upload anymore
      expect(
        mockPaymentRepository.createOrUpdateEnrollment,
      ).not.toHaveBeenCalled();
    });

    it('should fail when validation fails', async () => {
      vi.spyOn(
        mockPaymentValidationService,
        'validateAndPreparePayment',
      ).mockResolvedValue({
        isValid: false,
        errorResponse: { isSuccessful: false } as any,
      });

      const result = await paymentService.createBankTransferPayment({} as any, {
        userId: 'user-123',
        orderId: 'order-123',
        slipUrl: '',
      });

      expect(result.isSuccessful).toBe(false);
    });

    it('should handle upload errors', async () => {
      vi.spyOn(
        mockPaymentValidationService,
        'validateAndPreparePayment',
      ).mockResolvedValue({
        isValid: true,
        order: {
          id: 'order-123',
          totalAmount: 100000,
          userId: 'user-123',
          couponId: null,
        },
        orderItems: [{ id: 'item-1', courseId: 'course-1' }],
        finalAmount: 100000,
      } as any);

      vi.spyOn(mockBankTransferService, 'uploadPaymentSlip').mockRejectedValue(
        new Error('Upload failed'),
      );

      const result = await paymentService.createBankTransferPayment({} as any, {
        userId: 'user-123',
        orderId: 'order-123',
        slipUrl: '',
      });

      expect(result.isSuccessful).toBe(false);
      expect(result.errorDetails?.code).toBe(
        ERROR_CODES.PAYMENT.BANK_TRANSFER_CREATE_ERROR.code,
      );
    });
  });

  describe('getPayments', () => {
    it('should get payments successfully', async () => {
      vi.spyOn(mockPaymentRepository, 'findMany').mockResolvedValue([
        { id: 'pay_123' },
      ] as any);

      const result = await paymentService.getPayments({});

      expect(result).toHaveLength(1);
    });

    it('should handle errors', async () => {
      vi.spyOn(mockPaymentRepository, 'findMany').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await paymentService.getPayments({});

      expect(result).toEqual([]);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getMyPayments', () => {
    it('should get user payments successfully', async () => {
      vi.spyOn(mockPaymentRepository, 'findByUserId').mockResolvedValue([
        { id: 'pay_123' },
      ] as any);

      const result = await paymentService.getMyPayments('user-123');

      expect(result).toHaveLength(1);
    });

    it('should handle errors', async () => {
      vi.spyOn(mockPaymentRepository, 'findByUserId').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await paymentService.getMyPayments('user-123');

      expect(result).toEqual([]);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
