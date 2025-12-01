/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { OrderRepository } from '@/domains/order/repositories/order.repository';
import type { OrderItemDto } from '@/infrastructures/database/dto/order-item.dto';
import type { OrderDto } from '@/infrastructures/database/dto/order.dto';
import type { PrismaDatabase } from '@/infrastructures/database/prisma/prisma-database';

// Mock BaseRepository to prevent "Class extends value undefined" error
vi.mock('@/infrastructures/database/abstracts/base.repository', () => ({
  BaseRepository: class {
    constructor(
      protected prismaModel: any,
      protected dtoClass: any,
    ) {}
  },
}));

// Remove module mock
// vi.mock('@/infrastructures/database/repositories/order.repository', ...);

describe('OrderRepository', () => {
  let orderRepository: OrderRepository;
  let mockInfraRepository: any;
  let mockDb: PrismaDatabase;

  const mockOrder: OrderDto = {
    id: 'order-123',
    subtotalAmount: 1000,
    totalAmount: 1000,
    orderStatus: 'pending',
    couponId: null,
    userId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrderItem: OrderItemDto = {
    id: 'item-123',
    courseId: 'course-123',
    orderId: 'order-123',
    unitPrice: 1000,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockDb = {
      order: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      orderItem: {
        create: vi.fn(),
      },
    } as any;

    mockInfraRepository = {
      findOrderItemsByOrderId: vi.fn(),
      findCoursesByIds: vi.fn(),
      findOrderById: vi.fn(),
      findByUserId: vi.fn(),
    };

    orderRepository = new OrderRepository(mockInfraRepository, mockDb);
  });

  describe('createOrder', () => {
    it('should create order using prisma', async () => {
      const input = {
        userId: 'user-123',
        subtotalAmount: 1000,
        totalAmount: 1000,
        orderStatus: 'pending',
        couponId: null,
      };

      (mockDb.order.create as any).mockResolvedValue(mockOrder);

      const result = await orderRepository.createOrder(input);

      expect(result.id).toBe('order-123');
      expect(mockDb.order.create).toHaveBeenCalledWith({
        data: input,
      });
    });
  });

  describe('createOrderItem', () => {
    it('should create order item using prisma', async () => {
      const input = {
        orderId: 'order-123',
        courseId: 'course-123',
        unitPrice: 1000,
      };

      (mockDb.orderItem.create as any).mockResolvedValue(mockOrderItem);

      const result = await orderRepository.createOrderItem(input);

      expect(result.id).toBe('item-123');
      expect(mockDb.orderItem.create).toHaveBeenCalledWith({
        data: input,
      });
    });
  });

  describe('findOneById', () => {
    it('should find order by id using prisma', async () => {
      (mockDb.order.findUnique as any).mockResolvedValue(mockOrder);

      const result = await orderRepository.findOneById('order-123');

      expect(result?.id).toBe('order-123');
      expect(mockDb.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order-123' },
      });
    });

    it('should return null if order not found', async () => {
      (mockDb.order.findUnique as any).mockResolvedValue(null);

      const result = await orderRepository.findOneById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status using prisma', async () => {
      (mockDb.order.update as any).mockResolvedValue({
        ...mockOrder,
        orderStatus: 'successful',
      });

      const result = await orderRepository.updateOrderStatus(
        'order-123',
        'successful',
      );

      expect(result.orderStatus).toBe('successful');
      expect(mockDb.order.update).toHaveBeenCalledWith({
        where: { id: 'order-123' },
        data: { orderStatus: 'successful' },
      });
    });
  });

  describe('findOrderItemsByOrderId', () => {
    it('should delegate to infra repository', async () => {
      mockInfraRepository.findOrderItemsByOrderId.mockResolvedValue([
        mockOrderItem,
      ]);

      const result = await orderRepository.findOrderItemsByOrderId('order-123');

      expect(result).toHaveLength(1);
      expect(mockInfraRepository.findOrderItemsByOrderId).toHaveBeenCalledWith(
        'order-123',
      );
    });
  });

  describe('findCourseById', () => {
    it('should delegate to infra repository via findCoursesByIds', async () => {
      const mockCourse = { id: 'course-123', title: 'Test', price: 1000 };
      mockInfraRepository.findCoursesByIds.mockResolvedValue([mockCourse]);

      const result = await orderRepository.findCourseById('course-123');

      expect(result).toEqual(mockCourse);
      expect(mockInfraRepository.findCoursesByIds).toHaveBeenCalledWith([
        'course-123',
      ]);
    });

    it('should return null if course not found', async () => {
      mockInfraRepository.findCoursesByIds.mockResolvedValue([]);

      const result = await orderRepository.findCourseById('course-123');

      expect(result).toBeNull();
    });
  });

  describe('findOrderById', () => {
    it('should delegate to infra repository', async () => {
      mockInfraRepository.findOrderById.mockResolvedValue(mockOrder);

      const result = await orderRepository.findOrderById('order-123');

      expect(result).toEqual(mockOrder);
      expect(mockInfraRepository.findOrderById).toHaveBeenCalledWith(
        'order-123',
      );
    });
  });

  describe('findCoursesByIds', () => {
    it('should delegate to infra repository', async () => {
      const mockCourse = { id: 'course-123', title: 'Test', price: 1000 };
      mockInfraRepository.findCoursesByIds.mockResolvedValue([mockCourse]);

      const result = await orderRepository.findCoursesByIds(['course-123']);

      expect(result).toHaveLength(1);
      expect(mockInfraRepository.findCoursesByIds).toHaveBeenCalledWith([
        'course-123',
      ]);
    });
  });

  describe('findByUserId', () => {
    it('should delegate to infra repository', async () => {
      mockInfraRepository.findByUserId.mockResolvedValue([mockOrder]);

      const result = await orderRepository.findByUserId('user-123');

      expect(result).toHaveLength(1);
      expect(mockInfraRepository.findByUserId).toHaveBeenCalledWith('user-123');
    });
  });

  describe('TOKEN', () => {
    it('should have a unique TOKEN symbol', () => {
      expect(OrderRepository.TOKEN).toBeTypeOf('symbol');
      expect(OrderRepository.TOKEN.toString()).toBe('Symbol(OrderRepository)');
    });
  });
});
