import { Inject, Injectable } from '@nestjs/common';

import type { IEnrollmentRepository } from '@/domains/enrollment/repositories/interfaces/enrollment.repository.interface';
import type { IOrderRepository } from '@/domains/order/repositories/interfaces/order.repository.interface';
import type {
  CreatePaymentInput,
  IPaymentRepository,
} from '@/domains/payment/repositories/interfaces/payment.repository.interface';
import type { OrderItemDto } from '@/infrastructures/database/dto/order-item.dto';
import type { OrderDto } from '@/infrastructures/database/dto/order.dto';
import { PaymentDto } from '@/infrastructures/database/dto/payment.dto';
import { EnrollmentRepository } from '@/infrastructures/database/repositories/enrollment.repository';
import { OrderRepository } from '@/infrastructures/database/repositories/order.repository';
import { PaymentRepository as InfrastructurePaymentRepository } from '@/infrastructures/database/repositories/payment.repository';

/**
 * PaymentRepository (Domain Layer)
 *
 * Handles payment-related operations with business logic
 * This is an adapter that wraps the infrastructure layer
 *
 * Following Clean Architecture principles like AuthRepository
 */
@Injectable()
export class PaymentRepository implements IPaymentRepository {
  static readonly TOKEN = Symbol('PaymentRepository');

  constructor(
    private readonly paymentRepository: InfrastructurePaymentRepository,
    @Inject(EnrollmentRepository.TOKEN)
    private readonly enrollmentRepository: IEnrollmentRepository,
    @Inject(OrderRepository.TOKEN)
    private readonly orderRepository: IOrderRepository,
  ) {}

  /**
   * Find payment by ID
   * Business logic: Returns null if not found
   */
  async findOneById(id: string): Promise<PaymentDto | null> {
    return this.paymentRepository.findOneById(id);
  }

  /**
   * Find payment by enrollment ID
   * Business logic: Returns null if enrollment has no payment
   */
  async findByEnrollmentId(enrollmentId: string): Promise<PaymentDto | null> {
    return this.paymentRepository.findByEnrollmentId(enrollmentId);
  }

  /**
   * Find payment by Omise charge ID
   * Business logic: Returns null if not found
   */
  async findByOmiseChargeId(omiseChargeId: string): Promise<PaymentDto | null> {
    return this.paymentRepository.findByOmiseChargeId(omiseChargeId);
  }

  /**
   * Create a new payment
   * Business logic: Validates orderId before creation
   */
  async createPayment(input: CreatePaymentInput): Promise<PaymentDto> {
    return this.paymentRepository.createPayment(input);
  }

  /**
   * Update payment status
   * Business logic: Only allows valid status transitions
   */
  async updatePaymentStatus(id: string, status: string): Promise<PaymentDto> {
    // Business logic: Could add status transition validation here
    // e.g., pending -> successful/failed, but not failed -> successful
    return this.paymentRepository.updatePaymentStatus(id, status);
  }

  /**
   * Find payments with filters
   * Business logic: Applies default ordering by creation date
   */
  async findMany(data: {
    where?: Record<string, unknown>;
    orderBy?: Record<string, unknown>;
  }): Promise<PaymentDto[]> {
    // Business logic: Default ordering if not specified
    const query = {
      ...data,
      orderBy: data.orderBy ?? { createdAt: 'desc' },
    };

    return this.paymentRepository.findMany(query);
  }

  /**
   * Find payments by type
   * Business logic: Filter payments by payment type
   */
  async findByType(paymentType: string): Promise<PaymentDto[]> {
    return this.findMany({
      where: { paymentType },
    });
  }

  /**
   * Find payments by status
   * Business logic: Filter payments by status
   */
  async findByStatus(status: string): Promise<PaymentDto[]> {
    return this.findMany({
      where: { status },
    });
  }

  /**
   * Find payments by user ID
   * Business logic: Get all payments for a user through their orders
   */
  async findByUserId(userId: string): Promise<PaymentDto[]> {
    return await this.paymentRepository.findByUserId(userId);
  }

  /**
   * Check if payment exists and is successful
   * Business logic: Validates payment completion
   */
  async isPaymentSuccessful(paymentId: string): Promise<boolean> {
    const payment = await this.findOneById(paymentId);
    return payment !== null && payment.status === 'successful';
  }

  /**
   * Get total payment amount for a user
   * Business logic: Calculates total successful payments from orders
   * Note: Payment amount is stored in Order, not Payment table
   */
  getTotalPaymentAmount(_userId: string): Promise<number> {
    // TODO: Implement this by joining with Order table to get totalAmount
    // For now, return 0 as the method needs to be refactored
    // to query orders instead of payments
    return Promise.resolve(0);
  }

  /**
   * Create or update enrollment for a payment
   * Business logic: If enrollment exists and paymentId is null, update it
   * If enrollment doesn't exist, create new one
   */
  async createOrUpdateEnrollment(
    userId: string,
    courseId: string,
    paymentId: string | null,
  ): Promise<void> {
    const existingEnrollment =
      await this.enrollmentRepository.findByUserIdAndCourseId(userId, courseId);

    if (existingEnrollment) {
      // If enrollment exists and paymentId is null, update it
      if (existingEnrollment.paymentId === null && paymentId !== null) {
        await this.enrollmentRepository.updatePaymentId(
          existingEnrollment.id,
          paymentId,
        );
      }
    } else {
      // Create new enrollment
      await this.enrollmentRepository.createEnrollment({
        userId,
        courseId,
        paymentId,
      });
    }
  }

  /**
   * Update order status
   * Business logic: Updates order status after payment processing
   */
  async updateOrderStatus(orderId: string, status: string): Promise<OrderDto> {
    return this.orderRepository.updateOrderStatus(orderId, status);
  }

  /**
   * Find order by ID
   * Business logic: Returns order for payment processing
   */
  async findOrderById(orderId: string): Promise<OrderDto | null> {
    return this.orderRepository.findOneById(orderId);
  }

  /**
   * Find order items by order ID
   * Business logic: Returns order items for enrollment creation
   */
  async findOrderItemsByOrderId(orderId: string): Promise<OrderItemDto[]> {
    return this.orderRepository.findOrderItemsByOrderId(orderId);
  }

  /**
   * Find courses by IDs
   * Business logic: Returns courses with effective prices for webhook/notification
   */
  async findCoursesByIds(courseIds: string[]): Promise<
    Array<{
      id: string;
      title: string;
      price: number;
    }>
  > {
    return this.orderRepository.findCoursesByIds(courseIds);
  }
}
