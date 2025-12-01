import type { ConfigService } from '@nestjs/config';
import type { Express } from 'express-serve-static-core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ResponseOutputWithContent } from '@/common/response/response-output';
import { PaymentController } from '@/domains/payment/controller/payment.controller';
import type { IPaymentService } from '@/domains/payment/services/interfaces/payment.service.interface';
import { Language } from '@/enums/language.enum';
import { PaymentStatus } from '@/enums/payment-status.enum';

// Mock StorageService and OrderRepository
vi.mock('@/infrastructures/supabase/services/storage.service', () => ({
  StorageService: {
    TOKEN: Symbol('StorageService'),
  },
}));

vi.mock('@/domains/order/repositories/order.repository', () => ({
  OrderRepository: {
    TOKEN: Symbol('OrderRepository'),
  },
}));

// Mock SupabaseConnector to prevent TOKEN undefined error
vi.mock('@/infrastructures/supabase/services/supabase.connector', () => ({
  SupabaseConnector: {
    TOKEN: Symbol('SupabaseConnector'),
  },
}));

describe('PaymentController', () => {
  let controller: PaymentController;
  let mockPaymentService: Partial<IPaymentService>;

  const mockUser = { userId: 'user-123' };

  beforeEach(() => {
    mockPaymentService = {
      createCharge: vi.fn(),
      retrieveCharge: vi.fn(),
      createBankTransferPayment: vi.fn(),
      getPayments: vi.fn(),
      getMyPayments: vi.fn(),
      approveBankTransferPayment: vi.fn(),
    };

    const mockConfigService = {
      get: vi.fn().mockReturnValue('test-secret'),
    } as unknown as ConfigService;

    controller = new PaymentController(
      mockPaymentService as IPaymentService,
      mockConfigService,
    );
  });

  describe('createCharge', () => {
    it('should create charge successfully', async () => {
      const body = {
        orderId: 'order-123',
        cardNumber: '4242424242424242',
        cardName: 'John Doe',
        expirationMonth: 12,
        expirationYear: 2025,
        securityCode: '123',
        city: 'Bangkok',
        postalCode: '10100',
        description: 'Test payment',
      };

      const mockResult = ResponseOutputWithContent.successWithContent(body, {
        id: 'chrg_123',
        amount: 100000,
        currency: 'THB',
        status: PaymentStatus.SUCCESSFUL,
      });

      vi.spyOn(mockPaymentService, 'createCharge').mockResolvedValue(
        mockResult as never,
      );

      const result = await controller.createCharge(mockUser, body, Language.EN);

      expect(result.isSuccessful).toBe(true);
      expect(mockPaymentService.createCharge).toHaveBeenCalledWith({
        userId: 'user-123',
        orderId: 'order-123',
        cardNumber: '4242424242424242',
        cardName: 'John Doe',
        expirationMonth: 12,
        expirationYear: 2025,
        securityCode: '123',
        city: 'Bangkok',
        postalCode: '10100',
        description: 'Test payment',
      });
    });

    it('should handle errors', async () => {
      const body = {
        orderId: 'order-123',
        cardNumber: '4242424242424242',
        cardName: 'John Doe',
        expirationMonth: 12,
        expirationYear: 2025,
        securityCode: '123',
        city: 'Bangkok',
        postalCode: '10100',
      };

      vi.spyOn(mockPaymentService, 'createCharge').mockRejectedValue(
        new Error('Payment failed'),
      );

      const result = await controller.createCharge(mockUser, body, Language.EN);

      expect(result.isSuccessful).toBe(false);
    });
  });

  describe('retrieveCharge', () => {
    it('should retrieve charge successfully', async () => {
      const params = { chargeId: 'chrg_123' };

      const mockResult = ResponseOutputWithContent.successWithContent(params, {
        id: 'chrg_123',
        amount: 100000,
        currency: 'THB',
        status: PaymentStatus.SUCCESSFUL,
      });

      vi.spyOn(mockPaymentService, 'retrieveCharge').mockResolvedValue(
        mockResult as never,
      );

      const result = await controller.retrieveCharge(params, Language.EN);

      expect(result.isSuccessful).toBe(true);
      expect(mockPaymentService.retrieveCharge).toHaveBeenCalledWith({
        chargeId: 'chrg_123',
      });
    });

    it('should handle errors', async () => {
      const params = { chargeId: 'chrg_123' };

      vi.spyOn(mockPaymentService, 'retrieveCharge').mockRejectedValue(
        new Error('Charge not found'),
      );

      const result = await controller.retrieveCharge(params, Language.EN);

      expect(result.isSuccessful).toBe(false);
    });
  });

  describe('createBankTransferPayment', () => {
    it('should create bank transfer payment successfully', async () => {
      const file = {
        originalname: 'slip.jpg',
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      const body = { orderId: 'order-123' };

      const mockResult = ResponseOutputWithContent.successWithContent(body, {
        id: 'payment-123',
        slipUrl: 'https://example.com/slip.jpg',
        status: PaymentStatus.PENDING,
      });

      vi.spyOn(
        mockPaymentService,
        'createBankTransferPayment',
      ).mockResolvedValue(mockResult as never);

      const result = await controller.createBankTransferPayment(
        mockUser,
        file,
        body,
        Language.EN,
      );

      expect(result.isSuccessful).toBe(true);
      expect(mockPaymentService.createBankTransferPayment).toHaveBeenCalledWith(
        file,
        {
          userId: 'user-123',
          orderId: 'order-123',
          slipUrl: '',
        },
      );
    });

    it('should throw error when file is missing', async () => {
      const body = { orderId: 'order-123' };

      const result = await controller.createBankTransferPayment(
        mockUser,
        undefined,
        body,
        Language.EN,
      );

      expect(result.isSuccessful).toBe(false);
    });

    it('should handle service errors', async () => {
      const file = {
        originalname: 'slip.jpg',
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      const body = { orderId: 'order-123' };

      vi.spyOn(
        mockPaymentService,
        'createBankTransferPayment',
      ).mockRejectedValue(new Error('Upload failed'));

      const result = await controller.createBankTransferPayment(
        mockUser,
        file,
        body,
        Language.EN,
      );

      expect(result.isSuccessful).toBe(false);
    });
  });

  describe('getBankTransfers', () => {
    it('should get bank transfers successfully', async () => {
      const mockPayments = [
        { id: 'payment-1', type: 'Bank Transfer', status: 'pending' },
        { id: 'payment-2', type: 'Bank Transfer', status: 'successful' },
      ];

      vi.spyOn(mockPaymentService, 'getPayments').mockResolvedValue(
        mockPayments as never,
      );

      const result = await controller.getBankTransfers('pending', Language.EN);

      expect(result.isSuccessful).toBe(true);
      expect(mockPaymentService.getPayments).toHaveBeenCalledWith({
        type: 'Bank Transfer',
        status: 'pending',
      });
    });

    it('should handle errors', async () => {
      vi.spyOn(mockPaymentService, 'getPayments').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await controller.getBankTransfers(undefined, Language.EN);

      expect(result.isSuccessful).toBe(false);
    });
  });

  describe('getPayments', () => {
    it('should get all payments successfully', async () => {
      const mockPayments = [
        { id: 'payment-1', type: 'Credit Card' },
        { id: 'payment-2', type: 'Bank Transfer' },
      ];

      vi.spyOn(mockPaymentService, 'getPayments').mockResolvedValue(
        mockPayments as never,
      );

      const result = await controller.getPayments(
        'Credit Card',
        'successful',
        Language.EN,
      );

      expect(result.isSuccessful).toBe(true);
      expect(mockPaymentService.getPayments).toHaveBeenCalledWith({
        type: 'Credit Card',
        status: 'successful',
      });
    });

    it('should handle errors', async () => {
      vi.spyOn(mockPaymentService, 'getPayments').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await controller.getPayments(
        undefined,
        undefined,
        Language.EN,
      );

      expect(result.isSuccessful).toBe(false);
    });
  });

  describe('getMyPayments', () => {
    it('should get user payments successfully', async () => {
      const mockPayments = [
        { id: 'payment-1', userId: 'user-123' },
        { id: 'payment-2', userId: 'user-123' },
      ];

      vi.spyOn(mockPaymentService, 'getMyPayments').mockResolvedValue(
        mockPayments as never,
      );

      const result = await controller.getMyPayments(mockUser, Language.EN);

      expect(result.isSuccessful).toBe(true);
      expect(mockPaymentService.getMyPayments).toHaveBeenCalledWith('user-123');
    });

    it('should handle errors', async () => {
      vi.spyOn(mockPaymentService, 'getMyPayments').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await controller.getMyPayments(mockUser, Language.EN);

      expect(result.isSuccessful).toBe(false);
    });
  });
});
