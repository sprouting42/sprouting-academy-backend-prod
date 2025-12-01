import { describe, it, expect } from 'vitest';

import { BankTransferStatus } from '@/enums/bank-transfer-status.enum';
import { PaymentStatus } from '@/enums/payment-status.enum';

describe('Payment Enums', () => {
  describe('PaymentStatus', () => {
    it('should have correct values', () => {
      expect(PaymentStatus.PENDING).toBe('pending');
      expect(PaymentStatus.SUCCESSFUL).toBe('successful');
      expect(PaymentStatus.FAILED).toBe('failed');
      expect(PaymentStatus.REJECTED).toBe('rejected');
    });

    it('should have all expected statuses', () => {
      const statuses = Object.values(PaymentStatus);
      expect(statuses).toContain('pending');
      expect(statuses).toContain('successful');
      expect(statuses).toContain('failed');
      expect(statuses).toContain('rejected');
    });
  });

  describe('BankTransferStatus', () => {
    it('should have correct values', () => {
      expect(BankTransferStatus.PENDING).toBe('pending');
      expect(BankTransferStatus.APPROVED).toBe('successful');
      expect(BankTransferStatus.REJECTED).toBe('rejected');
    });

    it('should map to PaymentStatus values', () => {
      expect(BankTransferStatus.PENDING).toBe(PaymentStatus.PENDING);
      expect(BankTransferStatus.APPROVED).toBe(PaymentStatus.SUCCESSFUL);
      expect(BankTransferStatus.REJECTED).toBe(PaymentStatus.REJECTED);
    });
  });
});
