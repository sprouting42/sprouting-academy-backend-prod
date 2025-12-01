import type { OrderItemDto } from '@/infrastructures/database/dto/order-item.dto';
import type { OrderDto } from '@/infrastructures/database/dto/order.dto';
import type { PaymentDto } from '@/infrastructures/database/dto/payment.dto';

export type CreatePaymentInput = {
  paymentType: string;
  status: string;
  orderId: string;
  omiseChargeId?: string | null;
  slipImage?: string | null;
};

/**
 * Payment Repository Interface (Domain Layer)
 *
 * Defines payment-related operations following Clean Architecture
 * Similar to IAuthRepository pattern
 */
export interface IPaymentRepository {
  // Core payment operations
  findOneById(id: string): Promise<PaymentDto | null>;
  findByEnrollmentId(enrollmentId: string): Promise<PaymentDto | null>;
  findByOmiseChargeId(omiseChargeId: string): Promise<PaymentDto | null>;
  createPayment(input: CreatePaymentInput): Promise<PaymentDto>;
  updatePaymentStatus(id: string, status: string): Promise<PaymentDto>;

  // Query operations
  findMany(data: {
    where?: Record<string, unknown>;
    orderBy?: Record<string, unknown>;
  }): Promise<PaymentDto[]>;

  // Business query methods
  findByType(paymentType: string): Promise<PaymentDto[]>;
  findByStatus(status: string): Promise<PaymentDto[]>;
  findByUserId(userId: string): Promise<PaymentDto[]>;
  isPaymentSuccessful(paymentId: string): Promise<boolean>;
  getTotalPaymentAmount(userId: string): Promise<number>;

  // Payment-related enrollment and order operations
  createOrUpdateEnrollment(
    userId: string,
    courseId: string,
    paymentId: string | null,
  ): Promise<void>;
  updateOrderStatus(orderId: string, status: string): Promise<OrderDto>;
  findOrderById(orderId: string): Promise<OrderDto | null>;
  findOrderItemsByOrderId(orderId: string): Promise<OrderItemDto[]>;
  findCoursesByIds(courseIds: string[]): Promise<
    Array<{
      id: string;
      title: string;
      price: number;
    }>
  >;
}
