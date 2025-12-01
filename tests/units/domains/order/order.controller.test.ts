import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ResponseOutputWithContent } from '@/common/response/response-output';
import { OrderController } from '@/domains/order/controller/order.controller';
import type { IOrderService } from '@/domains/order/services/interfaces/order.service.interface';
import { Language } from '@/enums/language.enum';

// Mock SupabaseManager to prevent TOKEN undefined error
vi.mock('@/infrastructures/supabase/services/supabase.manager', () => ({
  SupabaseManager: {
    TOKEN: Symbol('SupabaseManager'),
  },
}));

// Mock BaseController to prevent "Class extends value undefined" error
vi.mock('@/common/controllers/base.controller', () => ({
  BaseController: class {
    protected actionResponse<TResponse>(result: TResponse): TResponse {
      return result;
    }
    protected actionResponseError(
      _language: unknown,
      error: unknown,
      _input?: unknown,
    ): { isSuccessful: boolean; error: unknown } {
      return { isSuccessful: false, error };
    }
  },
}));

describe('OrderController', () => {
  let controller: OrderController;
  let mockOrderService: Partial<IOrderService>;

  const mockUser = { userId: 'user-123' };

  beforeEach(() => {
    mockOrderService = {
      createOrder: vi.fn(),
      getOrderById: vi.fn(),
      getMyOrders: vi.fn(),
    };

    controller = new OrderController(mockOrderService as IOrderService);
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      const body = {
        items: [{ courseId: 'course-123' }, { courseId: 'course-456' }],
        couponId: undefined,
      };

      const mockResult = ResponseOutputWithContent.successWithContent(
        {
          userId: 'user-123',
          courseIds: ['course-123', 'course-456'],
          couponId: undefined,
        },
        {
          id: 'order-123',
          subtotalAmount: 3000,
          totalAmount: 3000,
          items: [
            { courseId: 'course-123', unitPrice: 1000 },
            { courseId: 'course-456', unitPrice: 2000 },
          ],
        },
      );

      vi.spyOn(mockOrderService, 'createOrder').mockResolvedValue(
        mockResult as never,
      );

      const result = await controller.createOrder(mockUser, body, Language.EN);

      expect(result.isSuccessful).toBe(true);
      expect(mockOrderService.createOrder).toHaveBeenCalledWith(Language.EN, {
        userId: 'user-123',
        courseIds: ['course-123', 'course-456'],
        couponId: undefined,
      });
    });

    it('should create order with coupon', async () => {
      const body = {
        items: [{ courseId: 'course-123' }],
        couponId: 'coupon-123',
      };

      const mockResult = ResponseOutputWithContent.successWithContent(
        {
          userId: 'user-123',
          courseIds: ['course-123'],
          couponId: 'coupon-123',
        },
        {
          id: 'order-123',
          subtotalAmount: 1000,
          totalAmount: 900,
          couponId: 'coupon-123',
          items: [{ courseId: 'course-123', unitPrice: 1000 }],
        },
      );

      vi.spyOn(mockOrderService, 'createOrder').mockResolvedValue(
        mockResult as never,
      );

      const result = await controller.createOrder(mockUser, body, Language.EN);

      expect(result.isSuccessful).toBe(true);
      expect(mockOrderService.createOrder).toHaveBeenCalledWith(Language.EN, {
        userId: 'user-123',
        courseIds: ['course-123'],
        couponId: 'coupon-123',
      });
    });

    it('should handle errors', async () => {
      const body = {
        items: [{ courseId: 'course-123' }],
        couponId: undefined,
      };

      vi.spyOn(mockOrderService, 'createOrder').mockRejectedValue(
        new Error('Course not found'),
      );

      const result = await controller.createOrder(mockUser, body, Language.EN);

      expect(result.isSuccessful).toBe(false);
    });
  });

  describe('getOrderById', () => {
    it('should get order by id successfully', async () => {
      const mockResult = ResponseOutputWithContent.successWithContent(
        { id: 'order-123' },
        {
          id: 'order-123',
          subtotalAmount: 1000,
          totalAmount: 1000,
          orderStatus: 'pending',
          items: [{ courseId: 'course-123', unitPrice: 1000 }],
        },
      );

      vi.spyOn(mockOrderService, 'getOrderById').mockResolvedValue(
        mockResult as never,
      );

      const result = await controller.getOrderById(
        'order-123',
        mockUser,
        Language.EN,
      );

      expect(result.isSuccessful).toBe(true);
      expect(mockOrderService.getOrderById).toHaveBeenCalledWith(
        'order-123',
        Language.EN,
      );
    });

    it('should handle errors', async () => {
      vi.spyOn(mockOrderService, 'getOrderById').mockRejectedValue(
        new Error('Order not found'),
      );

      const result = await controller.getOrderById(
        'order-123',
        mockUser,
        Language.EN,
      );

      expect(result.isSuccessful).toBe(false);
    });
  });

  describe('getMyOrders', () => {
    it('should get user orders successfully', async () => {
      const mockResult = ResponseOutputWithContent.successWithContent(
        { userId: 'user-123' },
        [
          {
            id: 'order-1',
            subtotalAmount: 1000,
            totalAmount: 1000,
            items: [],
          },
          {
            id: 'order-2',
            subtotalAmount: 2000,
            totalAmount: 2000,
            items: [],
          },
        ],
      );

      vi.spyOn(mockOrderService, 'getMyOrders').mockResolvedValue(
        mockResult as never,
      );

      const result = await controller.getMyOrders(mockUser, Language.EN);

      expect(result.isSuccessful).toBe(true);
      expect(mockOrderService.getMyOrders).toHaveBeenCalledWith(
        'user-123',
        Language.EN,
      );
    });

    it('should return empty array when user has no orders', async () => {
      const mockResult = ResponseOutputWithContent.successWithContent(
        { userId: 'user-123' },
        [],
      );

      vi.spyOn(mockOrderService, 'getMyOrders').mockResolvedValue(
        mockResult as never,
      );

      const result = await controller.getMyOrders(mockUser, Language.EN);

      expect(result.isSuccessful).toBe(true);
    });

    it('should handle errors', async () => {
      vi.spyOn(mockOrderService, 'getMyOrders').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await controller.getMyOrders(mockUser, Language.EN);

      expect(result.isSuccessful).toBe(false);
    });
  });
});
