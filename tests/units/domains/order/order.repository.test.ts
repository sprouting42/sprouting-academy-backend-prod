/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, it, expect, beforeEach, vi } from 'vitest';

import type {
  CreateOrderInput,
  CreateOrderItemInput,
} from '@/domains/order/repositories/dto/order.repository.dto';
import { OrderRepository } from '@/domains/order/repositories/order.repository';
import type { OrderItemDto } from '@/infrastructures/database/dto/order-item.dto';
import type { OrderDto } from '@/infrastructures/database/dto/order.dto';
import type { PrismaDatabase } from '@/infrastructures/database/prisma/prisma-database';
import type { OrderRepository as InfraOrderRepository } from '@/infrastructures/database/repositories/order.repository';

// Mock InfraOrderRepository to prevent loading issues
vi.mock('@/infrastructures/database/repositories/order.repository', () => ({
  OrderRepository: class {},
}));

describe('OrderRepository', () => {
  let orderRepository: OrderRepository;
  let mockInfraOrderRepository: Partial<InfraOrderRepository>;
  let mockDb: Partial<PrismaDatabase>;

  const mockOrder: OrderDto = {
    id: 'order-123',
    subtotalAmount: 1000,
    totalAmount: 900,
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

  beforeEach(() => {
    mockInfraOrderRepository = {
      findOrderItemsByOrderId: vi.fn(),
      findCoursesByIds: vi.fn(),
      findOrderById: vi.fn(),
      findByUserId: vi.fn(),
    };

    mockDb = {
      order: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      } as never,
      orderItem: {
        create: vi.fn(),
      } as never,
    };

    orderRepository = new OrderRepository(
      mockInfraOrderRepository as InfraOrderRepository,
      mockDb as PrismaDatabase,
    );
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      const input: CreateOrderInput = {
        userId: 'user-123',
        subtotalAmount: 1000,
        totalAmount: 900,
        orderStatus: 'pending',
      };

      vi.spyOn(mockDb.order!, 'create').mockResolvedValue({
        id: 'order-123',
        subtotalAmount: 1000,
        totalAmount: 900,
        orderStatus: 'pending',
        couponId: null,
        userId: 'user-123',
        createdAt: new Date('2025-01-01'),
      } as never);

      const result = await orderRepository.createOrder(input);

      expect(result.id).toBe('order-123');
      expect(result.totalAmount).toBe(900);
      expect(result.userId).toBe('user-123');
    });

    it('should create order with coupon', async () => {
      const input: CreateOrderInput = {
        userId: 'user-123',
        subtotalAmount: 1000,
        totalAmount: 800,
        orderStatus: 'pending',
        couponId: 'coupon-123',
      };

      vi.spyOn(mockDb.order!, 'create').mockResolvedValue({
        ...mockOrder,
        couponId: 'coupon-123',
      } as never);

      const result = await orderRepository.createOrder(input);

      expect(result.couponId).toBe('coupon-123');
    });
  });

  describe('createOrderItem', () => {
    it('should create order item successfully', async () => {
      const input: CreateOrderItemInput = {
        orderId: 'order-123',
        courseId: 'course-123',
        unitPrice: 1000,
      };

      vi.spyOn(mockDb.orderItem!, 'create').mockResolvedValue({
        id: 'item-123',
        courseId: 'course-123',
        orderId: 'order-123',
        unitPrice: 1000,
        createdAt: new Date('2025-01-01'),
      } as never);

      const result = await orderRepository.createOrderItem(input);

      expect(result.id).toBe('item-123');
      expect(result.courseId).toBe('course-123');
      expect(result.unitPrice).toBe(1000);
    });
  });

  describe('findOneById', () => {
    it('should find order by id successfully', async () => {
      vi.spyOn(mockDb.order!, 'findUnique').mockResolvedValue({
        id: 'order-123',
        subtotalAmount: 1000,
        totalAmount: 900,
        orderStatus: 'pending',
        couponId: null,
        userId: 'user-123',
        createdAt: new Date('2025-01-01'),
      } as never);

      const result = await orderRepository.findOneById('order-123');

      expect(result).toBeDefined();
      expect(result?.id).toBe('order-123');
    });

    it('should return null when order not found', async () => {
      vi.spyOn(mockDb.order!, 'findUnique').mockResolvedValue(null);

      const result = await orderRepository.findOneById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findOrderItemsByOrderId', () => {
    it('should find order items by order id', async () => {
      const items = [mockOrderItem];
      vi.spyOn(
        mockInfraOrderRepository,
        'findOrderItemsByOrderId',
      ).mockResolvedValue(items);

      const result = await orderRepository.findOrderItemsByOrderId('order-123');

      expect(result).toEqual(items);
      expect(
        mockInfraOrderRepository.findOrderItemsByOrderId,
      ).toHaveBeenCalledWith('order-123');
    });
  });

  describe('findCourseById', () => {
    it('should find course by id', async () => {
      const course = { id: 'course-123', title: 'Test Course', price: 1000 };
      vi.spyOn(mockInfraOrderRepository, 'findCoursesByIds').mockResolvedValue([
        course,
      ]);

      const result = await orderRepository.findCourseById('course-123');

      expect(result).toEqual(course);
    });

    it('should return null when course not found', async () => {
      vi.spyOn(mockInfraOrderRepository, 'findCoursesByIds').mockResolvedValue(
        [],
      );

      const result = await orderRepository.findCourseById('non-existent');

      expect(result).toBeNull();
    });

    it('should handle undefined first element in array', async () => {
      const sparseArray: Array<{
        id: string;
        title: string;
        price: number;
      }> = [];
      sparseArray[1] = { id: 'course-2', title: 'Course 2', price: 500 };
      vi.spyOn(mockInfraOrderRepository, 'findCoursesByIds').mockResolvedValue(
        sparseArray,
      );

      const result = await orderRepository.findCourseById('course-123');

      expect(result).toBeNull();
    });
  });

  describe('findOrderById', () => {
    it('should find order by id', async () => {
      vi.spyOn(mockInfraOrderRepository, 'findOrderById').mockResolvedValue(
        mockOrder,
      );

      const result = await orderRepository.findOrderById('order-123');

      expect(result).toEqual(mockOrder);
    });
  });

  describe('findCoursesByIds', () => {
    it('should find multiple courses by ids', async () => {
      const courses = [
        { id: 'course-1', title: 'Course 1', price: 1000 },
        { id: 'course-2', title: 'Course 2', price: 2000 },
      ];
      vi.spyOn(mockInfraOrderRepository, 'findCoursesByIds').mockResolvedValue(
        courses,
      );

      const result = await orderRepository.findCoursesByIds([
        'course-1',
        'course-2',
      ]);

      expect(result).toEqual(courses);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      vi.spyOn(mockDb.order!, 'update').mockResolvedValue({
        ...mockOrder,
        orderStatus: 'successful',
      } as never);

      const result = await orderRepository.updateOrderStatus(
        'order-123',
        'successful',
      );

      expect(result.orderStatus).toBe('successful');
      expect(mockDb.order!.update).toHaveBeenCalledWith({
        where: { id: 'order-123' },
        data: { orderStatus: 'successful' },
      });
    });
  });

  describe('findByUserId', () => {
    it('should find orders by user id', async () => {
      const orders = [mockOrder];
      vi.spyOn(mockInfraOrderRepository, 'findByUserId').mockResolvedValue(
        orders,
      );

      const result = await orderRepository.findByUserId('user-123');

      expect(result).toEqual(orders);
      expect(mockInfraOrderRepository.findByUserId).toHaveBeenCalledWith(
        'user-123',
      );
    });
  });

  describe('TOKEN', () => {
    it('should have a unique TOKEN symbol', () => {
      expect(OrderRepository.TOKEN).toBeTypeOf('symbol');
      expect(OrderRepository.TOKEN.toString()).toBe('Symbol(OrderRepository)');
    });
  });
});
