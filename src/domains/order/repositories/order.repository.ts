import { Injectable } from '@nestjs/common';

import type {
  CreateOrderInput,
  CreateOrderItemInput,
} from '@/domains/order/repositories/dto/order.repository.dto';
import type { IOrderRepository } from '@/domains/order/repositories/interfaces/order.repository.interface';
import { OrderItemDto } from '@/infrastructures/database/dto/order-item.dto';
import { OrderDto } from '@/infrastructures/database/dto/order.dto';
import { PrismaDatabase } from '@/infrastructures/database/prisma/prisma-database';
import { OrderRepository as InfraOrderRepository } from '@/infrastructures/database/repositories/order.repository';

@Injectable()
export class OrderRepository implements IOrderRepository {
  static readonly TOKEN = Symbol('OrderRepository');

  constructor(
    private readonly orderRepository: InfraOrderRepository,
    private readonly db: PrismaDatabase,
  ) {}

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
      subtotalAmount: Number(order.subtotalAmount),
      totalAmount: Number(order.totalAmount),
      orderStatus: order.orderStatus,
      couponId: order.couponId,
      userId: order.userId,
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

  async findOneById(id: string): Promise<OrderDto | null> {
    const order = await this.db.order.findUnique({
      where: { id },
    });

    if (!order) {
      return null;
    }

    return {
      id: order.id,
      subtotalAmount: Number(order.subtotalAmount),
      totalAmount: Number(order.totalAmount),
      orderStatus: order.orderStatus,
      couponId: order.couponId,
      userId: order.userId,
      createdAt: order.createdAt,
      updatedAt: order.createdAt, // Order doesn't have updatedAt in schema
    } as OrderDto;
  }

  async findOrderItemsByOrderId(orderId: string): Promise<OrderItemDto[]> {
    return this.orderRepository.findOrderItemsByOrderId(orderId);
  }

  async findCourseById(id: string): Promise<{
    id: string;
    title: string;
    price: number;
  } | null> {
    const courses = await this.orderRepository.findCoursesByIds([id]);
    return courses.length > 0 ? (courses[0] ?? null) : null;
  }

  async findOrderById(orderId: string): Promise<OrderDto | null> {
    return this.orderRepository.findOrderById(orderId);
  }

  async findCoursesByIds(courseIds: string[]): Promise<
    Array<{
      id: string;
      title: string;
      price: number;
    }>
  > {
    return this.orderRepository.findCoursesByIds(courseIds);
  }

  async updateOrderStatus(orderId: string, status: string): Promise<OrderDto> {
    const order = await this.db.order.update({
      where: { id: orderId },
      data: { orderStatus: status },
    });

    return {
      id: order.id,
      subtotalAmount: Number(order.subtotalAmount),
      totalAmount: Number(order.totalAmount),
      orderStatus: order.orderStatus,
      couponId: order.couponId,
      userId: order.userId,
      createdAt: order.createdAt,
      updatedAt: order.createdAt, // Order doesn't have updatedAt in schema
    } as OrderDto;
  }

  async findByUserId(userId: string): Promise<OrderDto[]> {
    return this.orderRepository.findByUserId(userId);
  }
}
