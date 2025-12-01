import { describe, it, expect, beforeEach, vi } from 'vitest';

import { CouponRepository } from '@/domains/payment/repositories/coupon.repository';
import type { CouponData } from '@/domains/payment/repositories/interfaces/coupon.repository.interface';
import type { PaymentRepository as InfrastructurePaymentRepository } from '@/infrastructures/database/repositories/payment.repository';

describe('CouponRepository', () => {
  let couponRepository: CouponRepository;
  let mockInfraRepository: Partial<InfrastructurePaymentRepository>;

  const mockCouponFromDb = {
    id: 'coupon-123',
    code: 'SAVE20',
    type: 'percentage',
    discount: '20',
    minOrderAmount: '1000',
    maxDiscount: '500',
    usageLimit: '100',
    usageCount: '50',
    status: 'active',
    startDate: new Date('2025-01-01'),
    expireDate: new Date('2025-12-31'),
  };

  const mockCouponData: CouponData = {
    id: 'coupon-123',
    code: 'SAVE20',
    type: 'percentage',
    discount: 20,
    minOrderAmount: 1000,
    maxDiscount: 500,
    usageLimit: 100,
    usageCount: 50,
    status: 'active',
    startDate: new Date('2025-01-01'),
    expireDate: new Date('2025-12-31'),
  };

  beforeEach(() => {
    mockInfraRepository = {
      findCouponById: vi.fn(),
      incrementCouponUsage: vi.fn(),
    };

    couponRepository = new CouponRepository(
      mockInfraRepository as InfrastructurePaymentRepository,
    );
  });

  describe('findById', () => {
    it('should return coupon data when coupon exists', async () => {
      if (mockInfraRepository.findCouponById) {
        vi.mocked(mockInfraRepository.findCouponById).mockResolvedValue(
          mockCouponFromDb as never,
        );
      }

      const result = await couponRepository.findById('coupon-123');

      expect(result).toEqual(mockCouponData);
      expect(mockInfraRepository.findCouponById).toHaveBeenCalledWith(
        'coupon-123',
      );
    });

    it('should return null when coupon does not exist', async () => {
      if (mockInfraRepository.findCouponById) {
        vi.mocked(mockInfraRepository.findCouponById).mockResolvedValue(
          null as never,
        );
      }

      const result = await couponRepository.findById('non-existent');

      expect(result).toBeNull();
      expect(mockInfraRepository.findCouponById).toHaveBeenCalledWith(
        'non-existent',
      );
    });

    it('should handle null minOrderAmount', async () => {
      const couponWithNullMin = {
        ...mockCouponFromDb,
        minOrderAmount: null,
      };

      if (mockInfraRepository.findCouponById) {
        vi.mocked(mockInfraRepository.findCouponById).mockResolvedValue(
          couponWithNullMin as never,
        );
      }

      const result = await couponRepository.findById('coupon-123');

      expect(result?.minOrderAmount).toBeNull();
    });

    it('should handle null maxDiscount', async () => {
      const couponWithNullMax = {
        ...mockCouponFromDb,
        maxDiscount: null,
      };

      if (mockInfraRepository.findCouponById) {
        vi.mocked(mockInfraRepository.findCouponById).mockResolvedValue(
          couponWithNullMax as never,
        );
      }

      const result = await couponRepository.findById('coupon-123');

      expect(result?.maxDiscount).toBeNull();
    });

    it('should handle null usageLimit', async () => {
      const couponWithNullLimit = {
        ...mockCouponFromDb,
        usageLimit: null,
      };

      if (mockInfraRepository.findCouponById) {
        vi.mocked(mockInfraRepository.findCouponById).mockResolvedValue(
          couponWithNullLimit as never,
        );
      }

      const result = await couponRepository.findById('coupon-123');

      expect(result?.usageLimit).toBeNull();
    });

    it('should convert string numbers to numbers', async () => {
      if (mockInfraRepository.findCouponById) {
        vi.mocked(mockInfraRepository.findCouponById).mockResolvedValue(
          mockCouponFromDb as never,
        );
      }

      const result = await couponRepository.findById('coupon-123');

      expect(typeof result?.discount).toBe('number');
      expect(typeof result?.minOrderAmount).toBe('number');
      expect(typeof result?.maxDiscount).toBe('number');
      expect(typeof result?.usageLimit).toBe('number');
      expect(typeof result?.usageCount).toBe('number');
    });
  });

  describe('incrementUsage', () => {
    it('should delegate to infra repository', async () => {
      if (mockInfraRepository.incrementCouponUsage) {
        vi.mocked(mockInfraRepository.incrementCouponUsage).mockResolvedValue(
          undefined as never,
        );
      }

      await couponRepository.incrementUsage('coupon-123');

      expect(mockInfraRepository.incrementCouponUsage).toHaveBeenCalledWith(
        'coupon-123',
      );
    });
  });

  describe('isValid', () => {
    it('should return valid true for active coupon', async () => {
      if (mockInfraRepository.findCouponById) {
        vi.mocked(mockInfraRepository.findCouponById).mockResolvedValue(
          mockCouponFromDb as never,
        );
      }

      const result = await couponRepository.isValid('coupon-123');

      expect(result.valid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should return valid false when coupon not found', async () => {
      if (mockInfraRepository.findCouponById) {
        vi.mocked(mockInfraRepository.findCouponById).mockResolvedValue(
          null as never,
        );
      }

      const result = await couponRepository.isValid('non-existent');

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Coupon not found');
    });

    it('should return valid false when coupon is inactive', async () => {
      const inactiveCoupon = {
        ...mockCouponFromDb,
        status: 'inactive',
      };

      if (mockInfraRepository.findCouponById) {
        vi.mocked(mockInfraRepository.findCouponById).mockResolvedValue(
          inactiveCoupon as never,
        );
      }

      const result = await couponRepository.isValid('coupon-123');

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Coupon is inactive');
    });

    it('should return valid false when coupon has expired', async () => {
      const expiredCoupon = {
        ...mockCouponFromDb,
        expireDate: new Date('2020-01-01'),
      };

      if (mockInfraRepository.findCouponById) {
        vi.mocked(mockInfraRepository.findCouponById).mockResolvedValue(
          expiredCoupon as never,
        );
      }

      const result = await couponRepository.isValid('coupon-123');

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Coupon has expired');
    });

    it('should return valid true when expireDate is null', async () => {
      const couponWithoutExpiry = {
        ...mockCouponFromDb,
        expireDate: null,
      };

      if (mockInfraRepository.findCouponById) {
        vi.mocked(mockInfraRepository.findCouponById).mockResolvedValue(
          couponWithoutExpiry as never,
        );
      }

      const result = await couponRepository.isValid('coupon-123');

      expect(result.valid).toBe(true);
    });

    it('should return valid false when usage limit reached', async () => {
      const couponAtLimit = {
        ...mockCouponFromDb,
        usageCount: '100', // equals usageLimit
      };

      if (mockInfraRepository.findCouponById) {
        vi.mocked(mockInfraRepository.findCouponById).mockResolvedValue(
          couponAtLimit as never,
        );
      }

      const result = await couponRepository.isValid('coupon-123');

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Usage limit reached');
    });

    it('should return valid false when usage count exceeds limit', async () => {
      const couponOverLimit = {
        ...mockCouponFromDb,
        usageCount: '101', // exceeds usageLimit of 100
      };

      if (mockInfraRepository.findCouponById) {
        vi.mocked(mockInfraRepository.findCouponById).mockResolvedValue(
          couponOverLimit as never,
        );
      }

      const result = await couponRepository.isValid('coupon-123');

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Usage limit reached');
    });

    it('should return valid true when usageLimit is null', async () => {
      const couponWithoutLimit = {
        ...mockCouponFromDb,
        usageLimit: null,
      };

      if (mockInfraRepository.findCouponById) {
        vi.mocked(mockInfraRepository.findCouponById).mockResolvedValue(
          couponWithoutLimit as never,
        );
      }

      const result = await couponRepository.isValid('coupon-123');

      expect(result.valid).toBe(true);
    });
  });

  describe('calculateDiscount', () => {
    it('should calculate percentage discount correctly', () => {
      const coupon: CouponData = {
        ...mockCouponData,
        type: 'percentage',
        discount: 20,
      };

      const result = couponRepository.calculateDiscount(coupon, 1000);

      expect(result).toBe(200); // 20% of 1000
    });

    it('should apply max discount cap for percentage discount', () => {
      const coupon: CouponData = {
        ...mockCouponData,
        type: 'percentage',
        discount: 20,
        maxDiscount: 100,
      };

      const result = couponRepository.calculateDiscount(coupon, 1000);

      expect(result).toBe(100); // Capped at maxDiscount, not 200
    });

    it('should not apply max discount when discount is less than max', () => {
      const coupon: CouponData = {
        ...mockCouponData,
        type: 'percentage',
        discount: 10,
        maxDiscount: 500,
      };

      const result = couponRepository.calculateDiscount(coupon, 1000);

      expect(result).toBe(100); // 10% of 1000, less than maxDiscount
    });

    it('should calculate fixed discount correctly', () => {
      const coupon: CouponData = {
        ...mockCouponData,
        type: 'fixed',
        discount: 500,
      };

      const result = couponRepository.calculateDiscount(coupon, 1000);

      expect(result).toBe(500);
    });

    it('should ignore max discount for fixed discount type', () => {
      const coupon: CouponData = {
        ...mockCouponData,
        type: 'fixed',
        discount: 500,
        maxDiscount: 100,
      };

      const result = couponRepository.calculateDiscount(coupon, 1000);

      expect(result).toBe(500); // Fixed discount, maxDiscount ignored
    });

    it('should return 0 for unknown discount type', () => {
      const coupon: CouponData = {
        ...mockCouponData,
        type: 'unknown',
        discount: 20,
      };

      const result = couponRepository.calculateDiscount(coupon, 1000);

      expect(result).toBe(0);
    });
  });

  describe('meetsMinimumOrder', () => {
    it('should return true when order amount meets minimum', () => {
      const coupon: CouponData = {
        ...mockCouponData,
        minOrderAmount: 1000,
      };

      const result = couponRepository.meetsMinimumOrder(coupon, 1500);

      expect(result).toBe(true);
    });

    it('should return true when order amount equals minimum', () => {
      const coupon: CouponData = {
        ...mockCouponData,
        minOrderAmount: 1000,
      };

      const result = couponRepository.meetsMinimumOrder(coupon, 1000);

      expect(result).toBe(true);
    });

    it('should return false when order amount is less than minimum', () => {
      const coupon: CouponData = {
        ...mockCouponData,
        minOrderAmount: 1000,
      };

      const result = couponRepository.meetsMinimumOrder(coupon, 500);

      expect(result).toBe(false);
    });

    it('should return true when minOrderAmount is null', () => {
      const coupon: CouponData = {
        ...mockCouponData,
        minOrderAmount: null,
      };

      const result = couponRepository.meetsMinimumOrder(coupon, 100);

      expect(result).toBe(true);
    });

    it('should return true when minOrderAmount is undefined', () => {
      const coupon: CouponData = {
        ...mockCouponData,
        minOrderAmount: undefined as unknown as null,
      };

      const result = couponRepository.meetsMinimumOrder(coupon, 100);

      expect(result).toBe(true);
    });
  });

  describe('TOKEN', () => {
    it('should have a unique TOKEN symbol', () => {
      expect(CouponRepository.TOKEN).toBeTypeOf('symbol');
      expect(CouponRepository.TOKEN.toString()).toBe(
        'Symbol(CouponRepository)',
      );
    });
  });
});
