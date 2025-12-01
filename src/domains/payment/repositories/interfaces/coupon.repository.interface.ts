export interface ICouponRepository {
  findById(id: string): Promise<CouponData | null>;
  incrementUsage(id: string): Promise<void>;
  isValid(couponId: string): Promise<{
    valid: boolean;
    reason?: string;
  }>;
  calculateDiscount(coupon: CouponData, orderAmount: number): number;
  meetsMinimumOrder(coupon: CouponData, orderAmount: number): boolean;
}

export interface CouponData {
  id: string;
  code: string;
  type: string;
  discount: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  status: string;
  startDate: Date | null;
  expireDate: Date | null;
}
