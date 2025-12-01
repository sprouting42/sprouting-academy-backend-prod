import { Inject, Injectable } from '@nestjs/common';

import { ERROR_CODES } from '@/common/errors/error-code';
import { ResponseOutputWithContent } from '@/common/response/response-output';
import { OMISE_MINIMUM_CHARGE_AMOUNT_THB } from '@/constants/currency';
import type { IOrderRepository } from '@/domains/order/repositories/interfaces/order.repository.interface';
import type { OrderItemDto } from '@/infrastructures/database/dto/order-item.dto';
import type { OrderDto } from '@/infrastructures/database/dto/order.dto';
import { OrderRepository } from '@/infrastructures/database/repositories/order.repository';
import { AppLoggerService } from '@/modules/logger/services/app-logger.service';

/**
 * PaymentValidationService
 *
 * Handles all payment validation logic
 * - Validate order and order items
 * - Validate payment amount matches order total
 * - Prepare payment data
 */
@Injectable()
export class PaymentValidationService {
  static readonly TOKEN = Symbol('PaymentValidationService');

  constructor(
    private readonly logger: AppLoggerService,
    @Inject(OrderRepository.TOKEN)
    private readonly orderRepository: IOrderRepository,
  ) {}

  /**
   * Validate and prepare payment (order)
   * Returns validated data or error response
   * Amount is retrieved from order.totalAmount automatically
   */
  async validateAndPreparePayment<T>(
    input: {
      userId: string;
      orderId: string;
    },
    inputForError: T,
  ): Promise<
    | {
        isValid: true;
        order: OrderDto;
        orderItems: OrderItemDto[];
        finalAmount: number;
      }
    | { isValid: false; errorResponse: ResponseOutputWithContent<T, unknown> }
  > {
    // 1. Validate order exists
    const order = await this.orderRepository.findOneById(input.orderId);

    if (!order) {
      this.logger.warn(
        `Order not found: ${input.orderId}`,
        PaymentValidationService.name,
      );
      return {
        isValid: false,
        errorResponse: ResponseOutputWithContent.failWithContent(
          ERROR_CODES.ORDER.ORDER_NOT_FOUND,
          inputForError,
        ),
      };
    }

    // 2. Validate order belongs to user
    if (order.userId !== input.userId) {
      this.logger.warn(
        `Order does not belong to user: orderId=${input.orderId}, userId=${input.userId}, orderUserId=${order.userId}`,
        PaymentValidationService.name,
      );
      return {
        isValid: false,
        errorResponse: ResponseOutputWithContent.failWithContent(
          ERROR_CODES.ORDER.ACCESS_DENIED,
          inputForError,
        ),
      };
    }

    // 3. Validate order status is pending
    if (order.orderStatus !== 'pending') {
      this.logger.warn(
        `Order is not pending: orderId=${input.orderId}, status=${order.orderStatus}`,
        PaymentValidationService.name,
      );
      return {
        isValid: false,
        errorResponse: ResponseOutputWithContent.failWithContent(
          ERROR_CODES.ORDER.ALREADY_PROCESSED,
          inputForError,
        ),
      };
    }

    // 4. Get order items
    const orderItems = await this.orderRepository.findOrderItemsByOrderId(
      input.orderId,
    );

    if (orderItems.length === 0) {
      this.logger.warn(
        `Order has no items: orderId=${input.orderId}`,
        PaymentValidationService.name,
      );
      return {
        isValid: false,
        errorResponse: ResponseOutputWithContent.failWithContent(
          ERROR_CODES.ORDER.EMPTY,
          inputForError,
        ),
      };
    }

    // 5. Get final amount from order (no need to validate since we use order.totalAmount directly)
    const finalAmount = Number(order.totalAmount);

    // 6. Validate minimum charge amount (Omise requirement: minimum 20 THB)
    if (finalAmount < OMISE_MINIMUM_CHARGE_AMOUNT_THB) {
      this.logger.warn(
        `Order amount below minimum: orderId=${input.orderId}, amount=${finalAmount}, minimum=${OMISE_MINIMUM_CHARGE_AMOUNT_THB}`,
        PaymentValidationService.name,
      );
      return {
        isValid: false,
        errorResponse: ResponseOutputWithContent.failWithContent(
          ERROR_CODES.PAYMENT.MINIMUM_AMOUNT_ERROR,
          inputForError,
        ),
      };
    }

    this.logger.log(
      `Order validated successfully: orderId=${input.orderId}, totalAmount=${finalAmount}`,
      PaymentValidationService.name,
    );

    return {
      isValid: true,
      order,
      orderItems,
      finalAmount,
    };
  }
}
