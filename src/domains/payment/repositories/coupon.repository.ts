import { Inject, Injectable } from '@nestjs/common';

import type {
  CouponData,
  ICouponRepository,
} from '@/domains/payment/repositories/interfaces/coupon.repository.interface';
import { PaymentRepository as InfrastructurePaymentRepository } from '@/infrastructures/database/repositories/payment.repository';

/**
 * CouponRepository (Domain Layer)
 *
 * Handles coupon-related operations with business logic
 * This is an adapter that wraps the infrastructure layer
 */
@Injectable()
export class CouponRepository implements ICouponRepository {
  static readonly TOKEN = Symbol('CouponRepository');

  constructor(
    @Inject(InfrastructurePaymentRepository.TOKEN)
    private readonly paymentRepository: InfrastructurePaymentRepository,
  ) {}

  /**
   * Find coupon by ID
   * Business logic: Returns null if coupon doesn't exist
   */
  async findById(id: string): Promise<CouponData | null> {
    const coupon = await this.paymentRepository.findCouponById(id);

    if (!coupon) {
      return null;
    }

    return {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      discount: Number(coupon.discount),
      minOrderAmount:
        coupon.minOrderAmount !== null && coupon.minOrderAmount !== undefined
          ? Number(coupon.minOrderAmount)
          : null,
      maxDiscount:
        coupon.maxDiscount !== null && coupon.maxDiscount !== undefined
          ? Number(coupon.maxDiscount)
          : null,
      usageLimit:
        coupon.usageLimit !== null && coupon.usageLimit !== undefined
          ? Number(coupon.usageLimit)
          : null,
      usageCount: Number(coupon.usageCount),
      status: coupon.status,
      startDate: coupon.startDate,
      expireDate: coupon.expireDate,
    };
  }

  /**
   * Increment coupon usage count
   * Business logic: Atomically increments usage for concurrency safety
   */
  async incrementUsage(id: string): Promise<void> {
    await this.paymentRepository.incrementCouponUsage(id);
  }

  /**
   * Validate if coupon is active
   * Business logic: Checks status, expiry, and usage limit
   */
  async isValid(couponId: string): Promise<{
    valid: boolean;
    reason?: string;
  }> {
    const coupon = await this.findById(couponId);

    if (!coupon) {
      return { valid: false, reason: 'Coupon not found' };
    }

    if (coupon.status !== 'active') {
      return { valid: false, reason: 'Coupon is inactive' };
    }

    if (coupon.expireDate && new Date(coupon.expireDate) < new Date()) {
      return { valid: false, reason: 'Coupon has expired' };
    }

    if (
      coupon.usageLimit !== null &&
      coupon.usageLimit !== undefined &&
      coupon.usageCount >= coupon.usageLimit
    ) {
      return { valid: false, reason: 'Usage limit reached' };
    }

    return { valid: true };
  }

  /**
   * Calculate discount amount
   * Business logic: Handles percentage and fixed discount types
   */
  calculateDiscount(coupon: CouponData, orderAmount: number): number {
    let discountAmount = 0;

    if (coupon.type === 'percentage') {
      discountAmount = (orderAmount * coupon.discount) / 100;

      // Apply max discount cap if exists
      if (
        coupon.maxDiscount !== null &&
        coupon.maxDiscount !== undefined &&
        discountAmount > coupon.maxDiscount
      ) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.type === 'fixed') {
      discountAmount = coupon.discount;
    }

    return discountAmount;
  }

  /**
   * Check if order meets minimum amount requirement
   * Business logic: Validates minimum order amount for coupon
   */
  meetsMinimumOrder(coupon: CouponData, orderAmount: number): boolean {
    if (coupon.minOrderAmount === null || coupon.minOrderAmount === undefined) {
      return true;
    }

    return orderAmount >= coupon.minOrderAmount;
  }
}
