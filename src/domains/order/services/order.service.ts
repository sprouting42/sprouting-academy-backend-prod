import { Inject, Injectable } from '@nestjs/common';

import { ERROR_CODES } from '@/common/errors/error-code';
import { ResponseOutputWithContent } from '@/common/response/response-output';
import type { IOrderRepository } from '@/domains/order/repositories/interfaces/order.repository.interface';
import { OrderRepository } from '@/domains/order/repositories/order.repository';
import { CreateOrderInput } from '@/domains/order/services/dto/create-order.input';
import { CreateOrderOutput } from '@/domains/order/services/dto/create-order.output';
import { OrderOutput } from '@/domains/order/services/dto/order.output';
import type { IOrderService } from '@/domains/order/services/interfaces/order.service.interface';
import { Language } from '@/enums/language.enum';
import { AppLoggerService } from '@/modules/logger/services/app-logger.service';

@Injectable()
export class OrderService implements IOrderService {
  static readonly TOKEN = Symbol('OrderService');

  constructor(
    private readonly logger: AppLoggerService,
    @Inject(OrderRepository.TOKEN)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async createOrder(
    language: Language,
    input: CreateOrderInput,
  ): Promise<ResponseOutputWithContent<CreateOrderInput, CreateOrderOutput>> {
    this.logger.debug(
      `Creating order: userId=${input.userId}, courseIds=${input.courseIds.join(',')}`,
      OrderService.name,
    );

    try {
      // 1. Validate courses exist and get prices
      const courses = await this.orderRepository.findCoursesByIds(
        input.courseIds,
      );

      // Check if all courses exist
      if (courses.length !== input.courseIds.length) {
        const foundCourseIds = new Set(courses.map(c => c.id));
        const missingCourseIds = input.courseIds.filter(
          id => !foundCourseIds.has(id),
        );
        this.logger.warn(
          `Some courses not found: ${missingCourseIds.join(', ')}`,
          OrderService.name,
        );
        return ResponseOutputWithContent.failWithContent(
          ERROR_CODES.ORDER.COURSE_NOT_FOUND,
          input,
          language,
        );
      }

      // 2. Calculate subtotal amount
      const subtotalAmount = courses.reduce(
        (sum, course) => sum + Number(course.price),
        0,
      );

      // 3. Skip coupon validation (feature not implemented yet)
      // TODO: Coupon feature - currently disabled, couponId is stored but not validated
      const totalAmount = subtotalAmount;
      let validatedCouponId: string | null = null;

      if (
        input.couponId !== null &&
        input.couponId !== undefined &&
        input.couponId.trim() !== ''
      ) {
        // Store couponId for future use, but don't validate or apply discount
        this.logger.debug(
          `Coupon ID provided but not validated (feature disabled): ${input.couponId}`,
          OrderService.name,
        );
        validatedCouponId = input.couponId;
        // totalAmount remains equal to subtotalAmount (no discount applied)
      }

      // 4. Create order
      const order = await this.orderRepository.createOrder({
        userId: input.userId,
        subtotalAmount,
        totalAmount,
        orderStatus: 'pending',
        couponId: validatedCouponId,
      });

      // 5. Create order items
      const orderItems = await Promise.all(
        courses.map(course =>
          this.orderRepository.createOrderItem({
            orderId: order.id,
            courseId: course.id,
            unitPrice: course.price,
          }),
        ),
      );

      // 6. Create output
      const output = CreateOrderOutput.create({
        id: order.id,
        subtotalAmount: order.subtotalAmount,
        totalAmount: order.totalAmount,
        orderStatus: order.orderStatus,
        items: orderItems.map(item => ({
          id: item.id,
          courseId: item.courseId,
          unitPrice: item.unitPrice,
          createdAt: item.createdAt,
        })),
        couponId: order.couponId ?? null,
        createdAt: order.createdAt,
      });

      this.logger.log(
        `Order created successfully: ${order.id}`,
        OrderService.name,
      );

      return ResponseOutputWithContent.successWithContent(input, output);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const stackTrace = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to create order: ${errorMessage}`,
        stackTrace,
        OrderService.name,
      );

      return ResponseOutputWithContent.failWithContent(
        ERROR_CODES.ORDER.CREATE_ORDER_ERROR,
        input,
        language,
      );
    }
  }

  async getOrderById(
    id: string,
    language: Language,
  ): Promise<ResponseOutputWithContent<{ id: string }, OrderOutput>> {
    this.logger.debug(`Getting order by ID: ${id}`, OrderService.name);

    try {
      const order = await this.orderRepository.findOrderById(id);

      if (!order) {
        this.logger.warn(`Order not found: ${id}`, OrderService.name);
        return ResponseOutputWithContent.failWithContent(
          ERROR_CODES.ORDER.ORDER_NOT_FOUND,
          { id },
          language,
        );
      }

      // Get order items
      const orderItems = await this.orderRepository.findOrderItemsByOrderId(
        order.id,
      );

      const output = OrderOutput.create({
        id: order.id,
        subtotalAmount: order.subtotalAmount,
        totalAmount: order.totalAmount,
        orderStatus: order.orderStatus,
        items: orderItems.map(item => ({
          id: item.id,
          courseId: item.courseId,
          unitPrice: item.unitPrice,
          createdAt: item.createdAt,
        })),
        couponId: order.couponId ?? null,
        createdAt: order.createdAt,
      });

      return ResponseOutputWithContent.successWithContent({ id }, output);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const stackTrace = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to get order: ${errorMessage}`,
        stackTrace,
        OrderService.name,
      );

      return ResponseOutputWithContent.failWithContent(
        ERROR_CODES.ORDER.INTERNAL_SERVER_ERROR,
        { id },
        language,
      );
    }
  }

  async getMyOrders(
    userId: string,
    language: Language,
  ): Promise<ResponseOutputWithContent<{ userId: string }, OrderOutput[]>> {
    this.logger.debug(`Getting orders for user: ${userId}`, OrderService.name);

    try {
      const orders = await this.orderRepository.findByUserId(userId);

      // Get order items for each order
      const outputs = await Promise.all(
        orders.map(async order => {
          const orderItems = await this.orderRepository.findOrderItemsByOrderId(
            order.id,
          );

          return OrderOutput.create({
            id: order.id,
            subtotalAmount: order.subtotalAmount,
            totalAmount: order.totalAmount,
            orderStatus: order.orderStatus,
            items: orderItems.map(item => ({
              id: item.id,
              courseId: item.courseId,
              unitPrice: item.unitPrice,
              createdAt: item.createdAt,
            })),
            couponId: order.couponId ?? null,
            createdAt: order.createdAt,
          });
        }),
      );

      return ResponseOutputWithContent.successWithContent({ userId }, outputs);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const stackTrace = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to get orders: ${errorMessage}`,
        stackTrace,
        OrderService.name,
      );

      return ResponseOutputWithContent.failWithContent(
        ERROR_CODES.ORDER.INTERNAL_SERVER_ERROR,
        { userId },
        language,
      );
    }
  }
}
