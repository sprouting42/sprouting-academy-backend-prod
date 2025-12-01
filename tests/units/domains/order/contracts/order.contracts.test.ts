import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, it, expect } from 'vitest';

import {
  CreateOrderRequestBody,
  OrderItemRequest,
} from '@/domains/order/controller/contracts/create-order.request';

describe('Order Controller Contracts', () => {
  describe('OrderItemRequest', () => {
    it('should validate valid order item', async () => {
      const dto = plainToClass(OrderItemRequest, {
        courseId: '550e8400-e29b-41d4-a716-446655440000',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with invalid UUID', async () => {
      const dto = plainToClass(OrderItemRequest, {
        courseId: 'invalid-uuid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('CreateOrderRequestBody', () => {
    it('should validate valid order request', async () => {
      const dto = plainToClass(CreateOrderRequestBody, {
        items: [
          { courseId: '550e8400-e29b-41d4-a716-446655440000' },
          { courseId: '550e8400-e29b-41d4-a716-446655440001' },
        ],
        couponId: '550e8400-e29b-41d4-a716-446655440002',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate order without coupon', async () => {
      const dto = plainToClass(CreateOrderRequestBody, {
        items: [{ courseId: '550e8400-e29b-41d4-a716-446655440000' }],
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with invalid coupon UUID', async () => {
      const dto = plainToClass(CreateOrderRequestBody, {
        items: [{ courseId: '550e8400-e29b-41d4-a716-446655440000' }],
        couponId: 'invalid-uuid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
