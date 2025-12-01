/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { PaymentStatus } from '@/enums/payment-status.enum';
import type { PrismaDatabase } from '@/infrastructures/database/prisma/prisma-database';
import { PaymentRepository } from '@/infrastructures/database/repositories/payment.repository';

describe('PaymentRepository (Infrastructure)', () => {
  let repository: PaymentRepository;
  let mockDb: PrismaDatabase;

  const mockPaymentEntity = {
    id: 'pay_123',
    paymentType: 'Credit Card',
    status: PaymentStatus.SUCCESSFUL,
    orderId: 'order_123',
    omiseChargeId: 'chrg_123',
    slipImage: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockDb = {
      payment: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        findFirst: vi.fn(),
      },
      enrollment: {
        findUnique: vi.fn(),
      },
      course: {
        findFirst: vi.fn(),
      },
      coupon: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    } as any;

    repository = new PaymentRepository(mockDb);
  });

  describe('findOneById', () => {
    it('should return payment dto when found', async () => {
      (mockDb.payment.findUnique as any).mockResolvedValue(mockPaymentEntity);

      const result = await repository.findOneById('pay_123');

      expect(result).toBeDefined();
      expect(result?.id).toBe('pay_123');
      expect(result?.status).toBe(PaymentStatus.SUCCESSFUL);
    });

    it('should return null when not found', async () => {
      (mockDb.payment.findUnique as any).mockResolvedValue(null);

      const result = await repository.findOneById('pay_123');

      expect(result).toBeNull();
    });
  });

  describe('findMany', () => {
    it('should return array of payment dtos', async () => {
      (mockDb.payment.findMany as any).mockResolvedValue([mockPaymentEntity]);

      const result = await repository.findMany({});

      expect(result).toHaveLength(1);
      if (result[0]) {
        expect(result[0].id).toBe('pay_123');
      }
    });
  });

  describe('createPayment', () => {
    it('should create payment successfully', async () => {
      (mockDb.payment.create as any).mockResolvedValue(mockPaymentEntity);

      const input = {
        paymentType: 'Credit Card',
        status: PaymentStatus.PENDING,
        orderId: 'order_123',
        omiseChargeId: 'chrg_123',
      };

      const result = await repository.createPayment(input);

      expect(result.id).toBe('pay_123');
      expect(mockDb.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          paymentType: 'Credit Card',
          omiseChargeId: 'chrg_123',
        }),
        select: expect.any(Object),
      });
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update status successfully', async () => {
      (mockDb.payment.update as any).mockResolvedValue({
        ...mockPaymentEntity,
        status: PaymentStatus.FAILED,
      });

      const result = await repository.updatePaymentStatus(
        'pay_123',
        PaymentStatus.FAILED,
      );

      expect(result.status).toBe(PaymentStatus.FAILED);
      expect(mockDb.payment.update).toHaveBeenCalledWith({
        where: { id: 'pay_123' },
        data: expect.objectContaining({ status: PaymentStatus.FAILED }),
        select: expect.any(Object),
      });
    });
  });

  describe('findByOmiseChargeId', () => {
    it('should find payment by omise charge id', async () => {
      (mockDb.payment.findFirst as any).mockResolvedValue(mockPaymentEntity);

      const result = await repository.findByOmiseChargeId('chrg_123');

      expect(result?.id).toBe('pay_123');
    });

    it('should return null if not found', async () => {
      (mockDb.payment.findFirst as any).mockResolvedValue(null);

      const result = await repository.findByOmiseChargeId('chrg_123');

      expect(result).toBeNull();
    });
  });

  describe('findByEnrollmentId', () => {
    it('should find payment via enrollment', async () => {
      (mockDb.enrollment.findUnique as any).mockResolvedValue({
        payment: mockPaymentEntity,
      });

      const result = await repository.findByEnrollmentId('enroll_123');

      expect(result?.id).toBe('pay_123');
    });

    it('should return null if enrollment or payment not found', async () => {
      (mockDb.enrollment.findUnique as any).mockResolvedValue(null);

      const result = await repository.findByEnrollmentId('enroll_123');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find payments by user id', async () => {
      (mockDb.payment.findMany as any).mockResolvedValue([mockPaymentEntity]);

      const result = await repository.findByUserId('user_123');

      expect(result).toHaveLength(1);
      expect(mockDb.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { order: { userId: 'user_123' } },
        }),
      );
    });
  });

  describe('findCourseByTitle', () => {
    it('should find course by title', async () => {
      (mockDb.course.findFirst as any).mockResolvedValue({
        id: 'course_123',
        title: 'Test Course',
        price: 1000,
      });

      const result = await repository.findCourseByTitle('Test Course');

      expect(result?.id).toBe('course_123');
    });
  });

  describe('findCouponById', () => {
    it('should find coupon by id', async () => {
      (mockDb.coupon.findUnique as any).mockResolvedValue({
        id: 'coupon_123',
        code: 'TEST',
        discount: 10,
        usageCount: 0,
      });

      const result = await repository.findCouponById('coupon_123');

      expect(result?.code).toBe('TEST');
    });
  });

  describe('incrementCouponUsage', () => {
    it('should increment usage count', async () => {
      (mockDb.coupon.update as any).mockResolvedValue({});

      await repository.incrementCouponUsage('coupon_123');

      expect(mockDb.coupon.update).toHaveBeenCalledWith({
        where: { id: 'coupon_123' },
        data: { usageCount: { increment: 1 } },
      });
    });
  });
});
