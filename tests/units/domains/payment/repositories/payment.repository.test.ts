/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { describe, it, expect, beforeEach, vi } from 'vitest';

import type { IEnrollmentRepository } from '@/domains/enrollment/repositories/interfaces/enrollment.repository.interface';
import type { IOrderRepository } from '@/domains/order/repositories/interfaces/order.repository.interface';
import { PaymentRepository } from '@/domains/payment/repositories/payment.repository';
import type { PaymentDto } from '@/infrastructures/database/dto/payment.dto';

// Remove module mock
// vi.mock('@/infrastructures/database/repositories/payment.repository', ...);

describe('PaymentRepository', () => {
  let paymentRepository: PaymentRepository;
  let mockInfraRepository: any;
  let mockEnrollmentRepository: Partial<IEnrollmentRepository>;
  let mockOrderRepository: Partial<IOrderRepository>;

  const mockPayment: PaymentDto = {
    id: 'pay_123',
    paymentType: 'Credit Card',
    status: 'successful',
    omiseChargeId: 'chrg_123',
    orderId: 'order_123',
    slipImage: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Create mock object directly
    mockInfraRepository = {
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

    // Inject mocked repos into domain repo
    paymentRepository = new PaymentRepository(
      mockInfraRepository,
      mockEnrollmentRepository as IEnrollmentRepository,
      mockOrderRepository as IOrderRepository,
    );
  });

  describe('findOneById', () => {
    it('should delegate to infra repository', async () => {
      mockInfraRepository.findOneById.mockResolvedValue(mockPayment);
      const result = await paymentRepository.findOneById('pay_123');
      expect(result).toBe(mockPayment);
      expect(mockInfraRepository.findOneById).toHaveBeenCalledWith('pay_123');
    });
  });

  describe('findByEnrollmentId', () => {
    it('should delegate to infra repository', async () => {
      mockInfraRepository.findByEnrollmentId.mockResolvedValue(mockPayment);
      const result = await paymentRepository.findByEnrollmentId('enroll_123');
      expect(result).toBe(mockPayment);
      expect(mockInfraRepository.findByEnrollmentId).toHaveBeenCalledWith(
        'enroll_123',
      );
    });
  });

  describe('findByOmiseChargeId', () => {
    it('should delegate to infra repository', async () => {
      mockInfraRepository.findByOmiseChargeId.mockResolvedValue(mockPayment);
      const result = await paymentRepository.findByOmiseChargeId('chrg_123');
      expect(result).toBe(mockPayment);
      expect(mockInfraRepository.findByOmiseChargeId).toHaveBeenCalledWith(
        'chrg_123',
      );
    });
  });

  describe('createPayment', () => {
    it('should delegate to infra repository', async () => {
      const input = {
        paymentType: 'Credit Card',
        status: 'pending',
        orderId: 'order_123',
      };
      mockInfraRepository.createPayment.mockResolvedValue(mockPayment);
      const result = await paymentRepository.createPayment(input);
      expect(result).toBe(mockPayment);
      expect(mockInfraRepository.createPayment).toHaveBeenCalledWith(input);
    });
  });

  describe('updatePaymentStatus', () => {
    it('should delegate to infra repository', async () => {
      mockInfraRepository.updatePaymentStatus.mockResolvedValue(mockPayment);
      const result = await paymentRepository.updatePaymentStatus(
        'pay_123',
        'failed',
      );
      expect(result).toBe(mockPayment);
      expect(mockInfraRepository.updatePaymentStatus).toHaveBeenCalledWith(
        'pay_123',
        'failed',
      );
    });
  });

  describe('findMany', () => {
    it('should apply default orderBy', async () => {
      mockInfraRepository.findMany.mockResolvedValue([mockPayment]);
      const result = await paymentRepository.findMany({});
      expect(result).toEqual([mockPayment]);
      expect(mockInfraRepository.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should use provided orderBy', async () => {
      mockInfraRepository.findMany.mockResolvedValue([mockPayment]);
      const orderBy = { updatedAt: 'asc' };
      const result = await paymentRepository.findMany({ orderBy });
      expect(result).toEqual([mockPayment]);
      expect(mockInfraRepository.findMany).toHaveBeenCalledWith({ orderBy });
    });
  });

  describe('findByType', () => {
    it('should call findMany with type filter', async () => {
      mockInfraRepository.findMany.mockResolvedValue([mockPayment]);
      const result = await paymentRepository.findByType('Credit Card');
      expect(result).toEqual([mockPayment]);
      expect(mockInfraRepository.findMany).toHaveBeenCalledWith({
        where: { paymentType: 'Credit Card' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findByStatus', () => {
    it('should call findMany with status filter', async () => {
      mockInfraRepository.findMany.mockResolvedValue([mockPayment]);
      const result = await paymentRepository.findByStatus('successful');
      expect(result).toEqual([mockPayment]);
      expect(mockInfraRepository.findMany).toHaveBeenCalledWith({
        where: { status: 'successful' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findByUserId', () => {
    it('should delegate to infra repository', async () => {
      mockInfraRepository.findByUserId.mockResolvedValue([mockPayment]);
      const result = await paymentRepository.findByUserId('user_123');
      expect(result).toEqual([mockPayment]);
      expect(mockInfraRepository.findByUserId).toHaveBeenCalledWith('user_123');
    });
  });

  describe('isPaymentSuccessful', () => {
    it('should return true if payment is successful', async () => {
      mockInfraRepository.findOneById.mockResolvedValue(mockPayment);
      const result = await paymentRepository.isPaymentSuccessful('pay_123');
      expect(result).toBe(true);
    });

    it('should return false if payment is not successful', async () => {
      mockInfraRepository.findOneById.mockResolvedValue({
        ...mockPayment,
        status: 'failed',
      });
      const result = await paymentRepository.isPaymentSuccessful('pay_123');
      expect(result).toBe(false);
    });

    it('should return false if payment not found', async () => {
      mockInfraRepository.findOneById.mockResolvedValue(null);
      const result = await paymentRepository.isPaymentSuccessful('pay_123');
      expect(result).toBe(false);
    });
  });

  describe('getTotalPaymentAmount', () => {
    it('should return 0 (not implemented)', async () => {
      const result = await paymentRepository.getTotalPaymentAmount('user_123');
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
