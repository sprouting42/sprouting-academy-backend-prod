import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ERROR_CODES } from '@/common/errors/error-code';
import type { IOrderRepository } from '@/domains/order/repositories/interfaces/order.repository.interface';
import type { CreateOrderInput } from '@/domains/order/services/dto/create-order.input';
import { OrderService } from '@/domains/order/services/order.service';
import { Language } from '@/enums/language.enum';
import type { OrderItemDto } from '@/infrastructures/database/dto/order-item.dto';
import type { OrderDto } from '@/infrastructures/database/dto/order.dto';
import type { AppLoggerService } from '@/modules/logger/services/app-logger.service';

// Mock ResponseOutputWithContent to prevent undefined error
vi.mock('@/common/response/response-output', () => ({
  ResponseOutputWithContent: {
    successWithContent: vi.fn(
      <TInput, TContent>(input: TInput, content: TContent) => ({
        isSuccessful: true,
        input,
        responseContent: content,
      }),
    ),
    failWithContent: vi.fn(<TInput>(errorCode: unknown, input: TInput) => ({
      isSuccessful: false,
      input,
      errorDetails: errorCode,
    })),
  },
}));

describe('OrderService', () => {
  let orderService: OrderService;
  let mockOrderRepository: Partial<IOrderRepository>;
  let mockLogger: Partial<AppLoggerService>;

  const mockOrder: OrderDto = {
    id: 'order-123',
    subtotalAmount: 1000,
    totalAmount: 1000,
    orderStatus: 'pending',
    couponId: null,
    userId: 'user-123',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockOrderItem: OrderItemDto = {
    id: 'item-123',
    courseId: 'course-123',
    orderId: 'order-123',
    unitPrice: 1000,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockCourses = [{ id: 'course-123', title: 'Course 1', price: 1000 }];

  beforeEach(() => {
    mockLogger = {
      debug: vi.fn(),
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    mockOrderRepository = {
      findCoursesByIds: vi.fn(),
      createOrder: vi.fn(),
      createOrderItem: vi.fn(),
      findOrderById: vi.fn(),
      findOrderItemsByOrderId: vi.fn(),
      findByUserId: vi.fn(),
    };

    orderService = new OrderService(
      mockLogger as AppLoggerService,
      mockOrderRepository as IOrderRepository,
    );
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      const input: CreateOrderInput = {
        userId: 'user-123',
        courseIds: ['course-123'],
        couponId: undefined,
      };

      vi.spyOn(mockOrderRepository, 'findCoursesByIds').mockResolvedValue(
        mockCourses,
      );
      vi.spyOn(mockOrderRepository, 'createOrder').mockResolvedValue(mockOrder);
      vi.spyOn(mockOrderRepository, 'createOrderItem').mockResolvedValue(
        mockOrderItem,
      );

      const result = await orderService.createOrder(Language.EN, input);

      expect(result.isSuccessful).toBe(true);
      expect(result.responseContent?.id).toBe('order-123');
      expect(result.responseContent?.subtotalAmount).toBe(1000);
      expect(result.responseContent?.totalAmount).toBe(1000);
      expect(result.responseContent?.items).toHaveLength(1);
    });

    it('should create order with multiple courses', async () => {
      const input: CreateOrderInput = {
        userId: 'user-123',
        courseIds: ['course-1', 'course-2'],
        couponId: undefined,
      };

      const courses = [
        { id: 'course-1', title: 'Course 1', price: 1000 },
        { id: 'course-2', title: 'Course 2', price: 2000 },
      ];

      vi.spyOn(mockOrderRepository, 'findCoursesByIds').mockResolvedValue(
        courses,
      );
      vi.spyOn(mockOrderRepository, 'createOrder').mockResolvedValue({
        ...mockOrder,
        subtotalAmount: 3000,
        totalAmount: 3000,
      });
      vi.spyOn(mockOrderRepository, 'createOrderItem').mockResolvedValue(
        mockOrderItem,
      );

      const result = await orderService.createOrder(Language.EN, input);

      expect(result.isSuccessful).toBe(true);
      expect(result.responseContent?.subtotalAmount).toBe(3000);
      expect(mockOrderRepository.createOrderItem).toHaveBeenCalledTimes(2);
    });

    it('should store coupon id without validation', async () => {
      const input: CreateOrderInput = {
        userId: 'user-123',
        courseIds: ['course-123'],
        couponId: 'coupon-123',
      };

      vi.spyOn(mockOrderRepository, 'findCoursesByIds').mockResolvedValue(
        mockCourses,
      );
      vi.spyOn(mockOrderRepository, 'createOrder').mockResolvedValue({
        ...mockOrder,
        couponId: 'coupon-123',
      });
      vi.spyOn(mockOrderRepository, 'createOrderItem').mockResolvedValue(
        mockOrderItem,
      );

      const result = await orderService.createOrder(Language.EN, input);

      expect(result.isSuccessful).toBe(true);
      expect(result.responseContent?.couponId).toBe('coupon-123');
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Coupon ID provided but not validated'),
        'OrderService',
      );
    });

    it('should fail when course not found', async () => {
      const input: CreateOrderInput = {
        userId: 'user-123',
        courseIds: ['course-1', 'course-2'],
        couponId: undefined,
      };

      vi.spyOn(mockOrderRepository, 'findCoursesByIds').mockResolvedValue([
        { id: 'course-1', title: 'Course 1', price: 1000 },
      ]);

      const result = await orderService.createOrder(Language.EN, input);

      expect(result.isSuccessful).toBe(false);
      expect(result.errorDetails?.code).toBe(
        ERROR_CODES.ORDER.COURSE_NOT_FOUND.code,
      );
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should handle order creation with coupon', async () => {
      const input: CreateOrderInput = {
        userId: 'user-123',
        courseIds: ['course-123'],
        couponId: 'coupon-123',
      };

      vi.spyOn(mockOrderRepository, 'findCoursesByIds').mockResolvedValue(
        mockCourses,
      );
      vi.spyOn(mockOrderRepository, 'createOrder').mockResolvedValue({
        ...mockOrder,
        couponId: 'coupon-123',
      });
      vi.spyOn(mockOrderRepository, 'createOrderItem').mockResolvedValue(
        mockOrderItem,
      );

      const result = await orderService.createOrder(Language.EN, input);

      expect(result.isSuccessful).toBe(true);
      expect(result.responseContent?.couponId).toBe('coupon-123');
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Coupon ID provided'),
        'OrderService',
      );
    });

    it('should handle create order errors', async () => {
      const input: CreateOrderInput = {
        userId: 'user-123',
        courseIds: ['course-123'],
        couponId: undefined,
      };

      vi.spyOn(mockOrderRepository, 'findCoursesByIds').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await orderService.createOrder(Language.EN, input);

      expect(result.isSuccessful).toBe(false);
      expect(result.errorDetails?.code).toBe(
        ERROR_CODES.ORDER.CREATE_ORDER_ERROR.code,
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle non-Error error objects', async () => {
      const input: CreateOrderInput = {
        userId: 'user-123',
        courseIds: ['course-123'],
        couponId: undefined,
      };

      vi.spyOn(mockOrderRepository, 'findCoursesByIds').mockRejectedValue(
        'String error',
      );

      const result = await orderService.createOrder(Language.EN, input);

      expect(result.isSuccessful).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Unknown error'),
        undefined,
        'OrderService',
      );
    });
  });

  describe('getOrderById', () => {
    it('should get order by id successfully', async () => {
      vi.spyOn(mockOrderRepository, 'findOrderById').mockResolvedValue(
        mockOrder,
      );
      vi.spyOn(
        mockOrderRepository,
        'findOrderItemsByOrderId',
      ).mockResolvedValue([mockOrderItem]);

      const result = await orderService.getOrderById('order-123', Language.EN);

      expect(result.isSuccessful).toBe(true);
      expect(result.responseContent?.id).toBe('order-123');
      expect(result.responseContent?.items).toHaveLength(1);
    });

    it('should fail when order not found', async () => {
      vi.spyOn(mockOrderRepository, 'findOrderById').mockResolvedValue(null);

      const result = await orderService.getOrderById(
        'non-existent',
        Language.EN,
      );

      expect(result.isSuccessful).toBe(false);
      expect(result.errorDetails?.code).toBe(
        ERROR_CODES.ORDER.ORDER_NOT_FOUND.code,
      );
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      vi.spyOn(mockOrderRepository, 'findOrderById').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await orderService.getOrderById('order-123', Language.EN);

      expect(result.isSuccessful).toBe(false);
      expect(result.errorDetails?.code).toBe(
        ERROR_CODES.ORDER.INTERNAL_SERVER_ERROR.code,
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getMyOrders', () => {
    it('should get user orders successfully', async () => {
      vi.spyOn(mockOrderRepository, 'findByUserId').mockResolvedValue([
        mockOrder,
      ]);
      vi.spyOn(
        mockOrderRepository,
        'findOrderItemsByOrderId',
      ).mockResolvedValue([mockOrderItem]);

      const result = await orderService.getMyOrders('user-123', Language.EN);

      expect(result.isSuccessful).toBe(true);
      expect(result.responseContent).toHaveLength(1);
      expect(result.responseContent?.[0]?.id).toBe('order-123');
    });

    it('should return empty array when user has no orders', async () => {
      vi.spyOn(mockOrderRepository, 'findByUserId').mockResolvedValue([]);

      const result = await orderService.getMyOrders('user-456', Language.EN);

      expect(result.isSuccessful).toBe(true);
      expect(result.responseContent).toHaveLength(0);
    });

    it('should handle errors gracefully', async () => {
      vi.spyOn(mockOrderRepository, 'findByUserId').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await orderService.getMyOrders('user-123', Language.EN);

      expect(result.isSuccessful).toBe(false);
      expect(result.errorDetails?.code).toBe(
        ERROR_CODES.ORDER.INTERNAL_SERVER_ERROR.code,
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('TOKEN', () => {
    it('should have a unique TOKEN symbol', () => {
      expect(OrderService.TOKEN).toBeTypeOf('symbol');
      expect(OrderService.TOKEN.toString()).toBe('Symbol(OrderService)');
    });
  });
});
