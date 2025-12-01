import { describe, it, expect, beforeEach, vi } from 'vitest';

import type { IEnrollmentRepository } from '@/domains/enrollment/repositories/interfaces/enrollment.repository.interface';
import type { IOrderRepository } from '@/domains/order/repositories/interfaces/order.repository.interface';
import type { CreatePaymentInput } from '@/domains/payment/repositories/interfaces/payment.repository.interface';
import { PaymentRepository } from '@/domains/payment/repositories/payment.repository';
import type { PaymentDto } from '@/infrastructures/database/dto/payment.dto';
import type { PaymentRepository as InfraPaymentRepository } from '@/infrastructures/database/repositories/payment.repository';

describe('PaymentRepository', () => {
  let paymentRepository: PaymentRepository;
  let mockInfraPaymentRepository: Partial<InfraPaymentRepository>;
  let mockEnrollmentRepository: Partial<IEnrollmentRepository>;
  let mockOrderRepository: Partial<IOrderRepository>;

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

  beforeEach(() => {
    mockInfraPaymentRepository = {
      findOneById: vi.fn(),
      findByEnrollmentId: vi.fn(),
      findByOmiseChargeId: vi.fn(),
      createPayment: vi.fn(),
      updatePaymentStatus: vi.fn(),
      findMany: vi.fn(),
      findByUserId: vi.fn(),
    };

    mockEnrollmentRepository = {
      findByUserIdAndCourseId: vi.fn(),
      createEnrollment: vi.fn(),
      updatePaymentId: vi.fn(),
    };

    mockOrderRepository = {
      findOneById: vi.fn(),
      findOrderItemsByOrderId: vi.fn(),
      updateOrderStatus: vi.fn(),
      findCoursesByIds: vi.fn(),
    };

    paymentRepository = new PaymentRepository(
      mockInfraPaymentRepository as InfraPaymentRepository,
      mockEnrollmentRepository as IEnrollmentRepository,
      mockOrderRepository as IOrderRepository,
    );
  });

  describe('findOneById', () => {
    it('should find payment by id successfully', async () => {
      vi.spyOn(mockInfraPaymentRepository, 'findOneById').mockResolvedValue(
        mockPayment,
      );

      const result = await paymentRepository.findOneById('payment-123');

      expect(result).toEqual(mockPayment);
      expect(mockInfraPaymentRepository.findOneById).toHaveBeenCalledWith(
        'payment-123',
      );
    });

    it('should return null when payment not found', async () => {
      vi.spyOn(mockInfraPaymentRepository, 'findOneById').mockResolvedValue(
        null,
      );

      const result = await paymentRepository.findOneById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByEnrollmentId', () => {
    it('should find payment by enrollment id', async () => {
      vi.spyOn(
        mockInfraPaymentRepository,
        'findByEnrollmentId',
      ).mockResolvedValue(mockPayment);

      const result = await paymentRepository.findByEnrollmentId('enroll-123');

      expect(result).toEqual(mockPayment);
      expect(
        mockInfraPaymentRepository.findByEnrollmentId,
      ).toHaveBeenCalledWith('enroll-123');
    });

    it('should return null when enrollment has no payment', async () => {
      vi.spyOn(
        mockInfraPaymentRepository,
        'findByEnrollmentId',
      ).mockResolvedValue(null);

      const result = await paymentRepository.findByEnrollmentId('enroll-456');

      expect(result).toBeNull();
    });
  });

  describe('findByOmiseChargeId', () => {
    it('should find payment by Omise charge id', async () => {
      vi.spyOn(
        mockInfraPaymentRepository,
        'findByOmiseChargeId',
      ).mockResolvedValue(mockPayment);

      const result =
        await paymentRepository.findByOmiseChargeId('chrg_test_123');

      expect(result).toEqual(mockPayment);
    });

    it('should return null when charge id not found', async () => {
      vi.spyOn(
        mockInfraPaymentRepository,
        'findByOmiseChargeId',
      ).mockResolvedValue(null);

      const result =
        await paymentRepository.findByOmiseChargeId('chrg_invalid');

      expect(result).toBeNull();
    });
  });

  describe('createPayment', () => {
    it('should create payment successfully', async () => {
      const input: CreatePaymentInput = {
        paymentType: 'Credit Card',
        status: 'pending',
        orderId: 'order-123',
      };

      vi.spyOn(mockInfraPaymentRepository, 'createPayment').mockResolvedValue(
        mockPayment,
      );

      const result = await paymentRepository.createPayment(input);

      expect(result).toEqual(mockPayment);
      expect(mockInfraPaymentRepository.createPayment).toHaveBeenCalledWith(
        input,
      );
    });

    it('should create bank transfer payment with slip image', async () => {
      const input: CreatePaymentInput = {
        paymentType: 'Bank Transfer',
        status: 'pending',
        orderId: 'order-456',
        slipImage: 'https://example.com/slip.jpg',
      };

      const bankTransferPayment = {
        ...mockPayment,
        paymentType: 'Bank Transfer',
        slipImage: input.slipImage,
      };

      vi.spyOn(mockInfraPaymentRepository, 'createPayment').mockResolvedValue(
        bankTransferPayment,
      );

      const result = await paymentRepository.createPayment(input);

      expect(result.slipImage).toBe(input.slipImage);
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update payment status successfully', async () => {
      const updatedPayment = { ...mockPayment, status: 'failed' };
      vi.spyOn(
        mockInfraPaymentRepository,
        'updatePaymentStatus',
      ).mockResolvedValue(updatedPayment);

      const result = await paymentRepository.updatePaymentStatus(
        'payment-123',
        'failed',
      );

      expect(result.status).toBe('failed');
      expect(
        mockInfraPaymentRepository.updatePaymentStatus,
      ).toHaveBeenCalledWith('payment-123', 'failed');
    });
  });

  describe('findMany', () => {
    it('should find payments with filters', async () => {
      const payments = [mockPayment];
      vi.spyOn(mockInfraPaymentRepository, 'findMany').mockResolvedValue(
        payments,
      );

      const result = await paymentRepository.findMany({
        where: { status: 'successful' },
      });

      expect(result).toEqual(payments);
      expect(mockInfraPaymentRepository.findMany).toHaveBeenCalledWith({
        where: { status: 'successful' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should apply default ordering when not specified', async () => {
      vi.spyOn(mockInfraPaymentRepository, 'findMany').mockResolvedValue([]);

      await paymentRepository.findMany({ where: {} });

      expect(mockInfraPaymentRepository.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should use custom ordering when specified', async () => {
      vi.spyOn(mockInfraPaymentRepository, 'findMany').mockResolvedValue([]);

      await paymentRepository.findMany({
        where: {},
        orderBy: { updatedAt: 'asc' },
      });

      expect(mockInfraPaymentRepository.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { updatedAt: 'asc' },
      });
    });
  });

  describe('findByType', () => {
    it('should find payments by type', async () => {
      const payments = [mockPayment];
      vi.spyOn(mockInfraPaymentRepository, 'findMany').mockResolvedValue(
        payments,
      );

      const result = await paymentRepository.findByType('Credit Card');

      expect(result).toEqual(payments);
      expect(mockInfraPaymentRepository.findMany).toHaveBeenCalledWith({
        where: { paymentType: 'Credit Card' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findByStatus', () => {
    it('should find payments by status', async () => {
      const payments = [mockPayment];
      vi.spyOn(mockInfraPaymentRepository, 'findMany').mockResolvedValue(
        payments,
      );

      const result = await paymentRepository.findByStatus('successful');

      expect(result).toEqual(payments);
      expect(mockInfraPaymentRepository.findMany).toHaveBeenCalledWith({
        where: { status: 'successful' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findByUserId', () => {
    it('should find payments by user id', async () => {
      const payments = [mockPayment];
      vi.spyOn(mockInfraPaymentRepository, 'findByUserId').mockResolvedValue(
        payments,
      );

      const result = await paymentRepository.findByUserId('user-123');

      expect(result).toEqual(payments);
      expect(mockInfraPaymentRepository.findByUserId).toHaveBeenCalledWith(
        'user-123',
      );
    });
  });

  describe('isPaymentSuccessful', () => {
    it('should return true for successful payment', async () => {
      vi.spyOn(mockInfraPaymentRepository, 'findOneById').mockResolvedValue(
        mockPayment,
      );

      const result = await paymentRepository.isPaymentSuccessful('payment-123');

      expect(result).toBe(true);
    });

    it('should return false for failed payment', async () => {
      const failedPayment = { ...mockPayment, status: 'failed' };
      vi.spyOn(mockInfraPaymentRepository, 'findOneById').mockResolvedValue(
        failedPayment,
      );

      const result = await paymentRepository.isPaymentSuccessful('payment-123');

      expect(result).toBe(false);
    });

    it('should return false when payment not found', async () => {
      vi.spyOn(mockInfraPaymentRepository, 'findOneById').mockResolvedValue(
        null,
      );

      const result =
        await paymentRepository.isPaymentSuccessful('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('getTotalPaymentAmount', () => {
    it('should return 0 (not implemented)', async () => {
      const result = await paymentRepository.getTotalPaymentAmount('user-123');

      expect(result).toBe(0);
    });
  });

  describe('TOKEN', () => {
    it('should have a unique TOKEN symbol', () => {
      expect(PaymentRepository.TOKEN).toBeTypeOf('symbol');
      expect(PaymentRepository.TOKEN.toString()).toBe(
        'Symbol(PaymentRepository)',
      );
    });
  });
});
