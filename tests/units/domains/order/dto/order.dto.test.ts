import { describe, it, expect } from 'vitest';

import type { CreateOrderInput } from '@/domains/order/services/dto/create-order.input';

describe('Order Service DTOs', () => {
  describe('CreateOrderInput', () => {
    it('should create valid order input', () => {
      const input: CreateOrderInput = {
        userId: 'user-123',
        courseIds: ['course-1', 'course-2'],
        couponId: 'coupon-123',
      };

      expect(input.userId).toBe('user-123');
      expect(input.courseIds).toHaveLength(2);
      expect(input.couponId).toBe('coupon-123');
    });

    it('should allow couponId to be undefined', () => {
      const input: CreateOrderInput = {
        userId: 'user-123',
        courseIds: ['course-1'],
      };

      expect(input.couponId).toBeUndefined();
    });
  });
});
