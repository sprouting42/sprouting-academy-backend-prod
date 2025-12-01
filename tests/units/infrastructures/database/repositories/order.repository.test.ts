/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { describe, it, expect, beforeEach, vi } from 'vitest';

import type { PrismaDatabase } from '@/infrastructures/database/prisma/prisma-database';
import { OrderRepository } from '@/infrastructures/database/repositories/order.repository';

describe('OrderRepository (Infrastructure)', () => {
  let repository: OrderRepository;
  let mockDb: PrismaDatabase;

  const mockOrderEntity = {
    id: 'order_123',
    userId: 'user_123',
    subtotalAmount: 1000,
    totalAmount: 1000,
    orderStatus: 'pending',
    couponId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockDb = {
      order: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
      },
      orderItem: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
      course: {
        findMany: vi.fn(),
      },
    } as any;

    repository = new OrderRepository(mockDb);
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      (mockDb.order.create as any).mockResolvedValue(mockOrderEntity);

      const input = {
        userId: 'user_123',
        subtotalAmount: 1000,
        totalAmount: 1000,
        orderStatus: 'pending',
        couponId: null,
      };

      const result = await repository.createOrder(input);

      expect(result.id).toBe('order_123');
      expect(mockDb.order.create).toHaveBeenCalledWith({
        data: input,
      });
    });
  });

  describe('findOneById', () => {
    it('should return order dto when found', async () => {
      (mockDb.order.findUnique as any).mockResolvedValue(mockOrderEntity);

      const result = await repository.findOneById('order_123');

      expect(result?.id).toBe('order_123');
    });

    it('should return null when not found', async () => {
      (mockDb.order.findUnique as any).mockResolvedValue(null);

      const result = await repository.findOneById('order_123');

      expect(result).toBeNull();
    });
  });

  describe('findOrderItemsByOrderId', () => {
    it('should return array of order items', async () => {
      (mockDb.course.findMany as any).mockResolvedValue([
        {
          id: 'course_123',
          title: 'Test Course',
          price: 1000,
        },
      ]);

      const result = await repository.findCoursesByIds(['course_123']);

      expect(result).toHaveLength(1);
      if (result[0]) {
        expect(result[0].id).toBe('course_123');
      }
    });
  });

  describe('findOrderById', () => {
    it('should return order dto', async () => {
      (mockDb.order.findUnique as any).mockResolvedValue(mockOrderEntity);

      const result = await repository.findOrderById('order_123');

      expect(result?.id).toBe('order_123');
    });
  });

  describe('updateOrderStatus', () => {
    it('should update status successfully', async () => {
      (mockDb.order.update as any).mockResolvedValue({
        ...mockOrderEntity,
        orderStatus: 'successful',
      });

      const result = await repository.updateOrderStatus(
        'order_123',
        'successful',
      );

      expect(result.orderStatus).toBe('successful');
      expect(mockDb.order.update).toHaveBeenCalledWith({
        where: { id: 'order_123' },
        data: { orderStatus: 'successful' },
      });
    });
  });

  describe('findByUserId', () => {
    it('should return user orders', async () => {
      (mockDb.order.findMany as any).mockResolvedValue([mockOrderEntity]);

      const result = await repository.findByUserId('user_123');

      expect(result).toHaveLength(1);
      expect(mockDb.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user_123' },
        }),
      );
    });
  });
});
