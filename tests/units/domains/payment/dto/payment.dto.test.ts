import { describe, it, expect } from 'vitest';

import { ApproveBankTransferInput } from '@/domains/payment/services/dto/approve-bank-transfer.input';
import { ApproveBankTransferOutput } from '@/domains/payment/services/dto/approve-bank-transfer.output';
import type { CreateBankTransferInput } from '@/domains/payment/services/dto/create-bank-transfer.input';
import type { CreateChargeInput } from '@/domains/payment/services/dto/create-charge.input';
import type { RetrieveChargeInput } from '@/domains/payment/services/dto/retrieve-charge.input';
import { PaymentStatus } from '@/enums/payment-status.enum';

describe('Payment Service DTOs', () => {
  describe('CreateChargeInput', () => {
    it('should create valid charge input', () => {
      const input: CreateChargeInput = {
        userId: 'user-123',
        orderId: 'order-123',
        cardNumber: '4242424242424242',
        cardName: 'John Doe',
        expirationMonth: 12,
        expirationYear: 2025,
        securityCode: '123',
        city: 'Bangkok',
        postalCode: '10110',
        description: 'Test payment',
      };

      expect(input.userId).toBe('user-123');
      expect(input.cardNumber).toBe('4242424242424242');
    });

    it('should allow optional fields to be undefined', () => {
      const input: CreateChargeInput = {
        userId: 'user-123',
        orderId: 'order-123',
        cardNumber: '4242424242424242',
        cardName: 'John Doe',
        expirationMonth: 12,
        expirationYear: 2025,
        securityCode: '123',
      };

      expect(input.city).toBeUndefined();
      expect(input.postalCode).toBeUndefined();
      expect(input.description).toBeUndefined();
    });
  });

  describe('CreateBankTransferInput', () => {
    it('should create valid bank transfer input', () => {
      const input: CreateBankTransferInput = {
        userId: 'user-123',
        orderId: 'order-123',
        slipUrl: 'https://example.com/slip.jpg',
      };

      expect(input.userId).toBe('user-123');
      expect(input.slipUrl).toBe('https://example.com/slip.jpg');
    });
  });

  describe('RetrieveChargeInput', () => {
    it('should create valid retrieve charge input', () => {
      const input: RetrieveChargeInput = {
        chargeId: 'chrg_123',
      };

      expect(input.chargeId).toBe('chrg_123');
    });
  });

  describe('ApproveBankTransferInput', () => {
    it('should create valid approve bank transfer input with all fields', () => {
      const input = new ApproveBankTransferInput();
      input.paymentId = 'payment-123';
      input.approved = true;
      input.reason = 'Payment verified';

      expect(input.paymentId).toBe('payment-123');
      expect(input.approved).toBe(true);
      expect(input.reason).toBe('Payment verified');
    });

    it('should allow reason to be undefined', () => {
      const input = new ApproveBankTransferInput();
      input.paymentId = 'payment-123';
      input.approved = false;

      expect(input.paymentId).toBe('payment-123');
      expect(input.approved).toBe(false);
      expect(input.reason).toBeUndefined();
    });

    it('should handle rejected payment', () => {
      const input = new ApproveBankTransferInput();
      input.paymentId = 'payment-456';
      input.approved = false;
      input.reason = 'Invalid slip';

      expect(input.approved).toBe(false);
      expect(input.reason).toBe('Invalid slip');
    });
  });

  describe('ApproveBankTransferOutput', () => {
    it('should create valid approve bank transfer output with all fields', () => {
      const data: ApproveBankTransferOutput = {
        paymentId: 'payment-123',
        status: PaymentStatus.SUCCESSFUL,
        orderId: 'order-456',
        approved: true,
        reason: 'Payment verified',
        updatedAt: new Date('2025-01-01'),
      };

      const output = ApproveBankTransferOutput.create(data);

      expect(output.paymentId).toBe('payment-123');
      expect(output.status).toBe(PaymentStatus.SUCCESSFUL);
      expect(output.orderId).toBe('order-456');
      expect(output.approved).toBe(true);
      expect(output.reason).toBe('Payment verified');
      expect(output.updatedAt).toEqual(new Date('2025-01-01'));
    });

    it('should create output without reason', () => {
      const data: ApproveBankTransferOutput = {
        paymentId: 'payment-123',
        status: PaymentStatus.SUCCESSFUL,
        orderId: 'order-456',
        approved: true,
        updatedAt: new Date('2025-01-01'),
      };

      const output = ApproveBankTransferOutput.create(data);

      expect(output.paymentId).toBe('payment-123');
      expect(output.approved).toBe(true);
      expect(output.reason).toBeUndefined();
    });

    it('should handle rejected payment output', () => {
      const data: ApproveBankTransferOutput = {
        paymentId: 'payment-456',
        status: PaymentStatus.FAILED,
        orderId: 'order-789',
        approved: false,
        reason: 'Invalid payment slip',
        updatedAt: new Date('2025-01-02'),
      };

      const output = ApproveBankTransferOutput.create(data);

      expect(output.approved).toBe(false);
      expect(output.status).toBe(PaymentStatus.FAILED);
      expect(output.reason).toBe('Invalid payment slip');
    });

    it('should handle pending status', () => {
      const data: ApproveBankTransferOutput = {
        paymentId: 'payment-789',
        status: PaymentStatus.PENDING,
        orderId: 'order-101',
        approved: false,
        updatedAt: new Date('2025-01-03'),
      };

      const output = ApproveBankTransferOutput.create(data);

      expect(output.status).toBe(PaymentStatus.PENDING);
      expect(output.approved).toBe(false);
    });
  });
});
