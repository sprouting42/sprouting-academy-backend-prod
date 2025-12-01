import { Injectable, Scope } from '@nestjs/common';

import type {
  CreateOrderInput,
  CreateOrderItemInput,
} from '@/domains/order/repositories/dto/order.repository.dto';
import { BaseRepository } from '@/infrastructures/database/abstracts/base.repository';
import { OrderItemDto } from '@/infrastructures/database/dto/order-item.dto';
import { OrderDto } from '@/infrastructures/database/dto/order.dto';
import { OrderEntity } from '@/infrastructures/database/entites/order.entity';
import { PrismaDatabase } from '@/infrastructures/database/prisma/prisma-database';
import { calculateEffectivePrice } from '@/utils/price.util';

@Injectable({ scope: Scope.REQUEST })
export class OrderRepository extends BaseRepository<
  OrderEntity,
  OrderDto,
  PrismaDatabase['order']
> {
  static readonly TOKEN = Symbol('OrderRepository');
  constructor(private readonly db: PrismaDatabase) {
    super(db.order, OrderDto);
  }

  async createOrder(input: CreateOrderInput): Promise<OrderDto> {
    const order = await this.db.order.create({
      data: {
        userId: input.userId,
        subtotalAmount: input.subtotalAmount,
        totalAmount: input.totalAmount,
        orderStatus: input.orderStatus,
        couponId: input.couponId ?? null,
      },
    });

    return {
      id: order.id,
      userId: order.userId,
      subtotalAmount: Number(order.subtotalAmount),
      totalAmount: Number(order.totalAmount),
      orderStatus: order.orderStatus,
      couponId: order.couponId,
      createdAt: order.createdAt,
      updatedAt: order.createdAt, // Order doesn't have updatedAt in schema
    } as OrderDto;
  }

  async createOrderItem(input: CreateOrderItemInput): Promise<OrderItemDto> {
    const item = await this.db.orderItem.create({
      data: {
        orderId: input.orderId,
        courseId: input.courseId,
        unitPrice: input.unitPrice,
      },
    });

    return {
      id: item.id,
      courseId: item.courseId,
      orderId: item.orderId,
      unitPrice: Number(item.unitPrice),
      createdAt: item.createdAt,
      updatedAt: item.createdAt, // OrderItem doesn't have updatedAt in schema
    } as OrderItemDto;
  }

  override async findOneById(id: string): Promise<OrderDto | null> {
    return this.findOrderById(id);
  }

  async findOrderById(orderId: string): Promise<OrderDto | null> {
    const order = await this.db.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      return null;
    }

    return {
      id: order.id,
      userId: order.userId,
      subtotalAmount: Number(order.subtotalAmount),
      totalAmount: Number(order.totalAmount),
      orderStatus: order.orderStatus,
      couponId: order.couponId,
      createdAt: order.createdAt,
      updatedAt: order.createdAt, // Order doesn't have updatedAt in schema
    } as OrderDto;
  }

  async findOrderItemsByOrderId(orderId: string): Promise<OrderItemDto[]> {
    const items = await this.db.orderItem.findMany({
      where: { orderId },
    });

    return items.map(item => ({
      id: item.id,
      courseId: item.courseId,
      orderId: item.orderId,
      unitPrice: Number(item.unitPrice),
      createdAt: item.createdAt,
      updatedAt: item.createdAt, // OrderItem doesn't have updatedAt in schema
    })) as OrderItemDto[];
  }

  async findCourseById(id: string): Promise<{
    id: string;
    title: string;
    price: number;
  } | null> {
    const courses = await this.findCoursesByIds([id]);
    return courses.length > 0 ? (courses[0] ?? null) : null;
  }

  /**
   * Find courses by IDs and calculate effective prices (considering early bird pricing)
   *
   * The effective price is calculated based on:
   * - Normal price (always available)
   * - Early bird price (if configured and current date is within the period)
   *
   * Business rules:
   * - Early bird price must be less than normal price
   * - Early bird start date must be before end date
   * - If any validation fails, normal price is used
   *
   * @param courseIds - Array of course IDs to fetch
   * @returns Array of courses with calculated effective prices
   */
  async findCoursesByIds(courseIds: string[]): Promise<
    Array<{
      id: string;
      title: string;
      price: number;
    }>
  > {
    const courses = await this.db.course.findMany({
      where: {
        id: {
          in: courseIds,
        },
      },
      select: {
        id: true,
        coursesTitle: true,
        normalPrice: true,
        earlyBirdPricePrice: true,
        earlyBirdPriceStartDate: true,
        earlyBirdPriceEndDate: true,
      },
    });

    return courses.map(course => {
      // Calculate effective price using utility function
      const effectivePrice = calculateEffectivePrice({
        normalPrice: Number(course.normalPrice),
        earlyBirdPrice:
          course.earlyBirdPricePrice === null
            ? null
            : Number(course.earlyBirdPricePrice),
        earlyBirdPriceStartDate: course.earlyBirdPriceStartDate,
        earlyBirdPriceEndDate: course.earlyBirdPriceEndDate,
      });

      return {
        id: course.id,
        title: course.coursesTitle,
        price: effectivePrice,
      };
    });
  }

  async updateOrderStatus(orderId: string, status: string): Promise<OrderDto> {
    const order = await this.db.order.update({
      where: { id: orderId },
      data: { orderStatus: status },
    });

    return {
      id: order.id,
      userId: order.userId,
      subtotalAmount: Number(order.subtotalAmount),
      totalAmount: Number(order.totalAmount),
      orderStatus: order.orderStatus,
      couponId: order.couponId,
      createdAt: order.createdAt,
      updatedAt: order.createdAt, // Order doesn't have updatedAt in schema
    } as OrderDto;
  }

  async findByUserId(userId: string): Promise<OrderDto[]> {
    const orders = await this.db.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(order => ({
      id: order.id,
      userId: order.userId,
      subtotalAmount: Number(order.subtotalAmount),
      totalAmount: Number(order.totalAmount),
      orderStatus: order.orderStatus,
      couponId: order.couponId,
      createdAt: order.createdAt,
      updatedAt: order.createdAt, // Order doesn't have updatedAt in schema
    })) as OrderDto[];
  }
}
