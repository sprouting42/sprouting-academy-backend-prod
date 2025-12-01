import {
  BadRequestException,
  Inject,
  Injectable,
  HttpStatus,
} from '@nestjs/common';
import type { Express } from 'express-serve-static-core';

import { ERROR_CODES } from '@/common/errors/error-code';
import type { ErrorCode } from '@/common/errors/types/error-code.type';
import { ResponseOutputWithContent } from '@/common/response/response-output';
// CouponRepository removed - feature not implemented yet
// import { CouponRepository } from '@/domains/payment/repositories/coupon.repository';
// import type { ICouponRepository } from '@/domains/payment/repositories/interfaces/coupon.repository.interface';
import type { IPaymentRepository } from '@/domains/payment/repositories/interfaces/payment.repository.interface';
import { PaymentRepository } from '@/domains/payment/repositories/payment.repository';
import { BankTransferService } from '@/domains/payment/services/bank-transfer.service';
import { CreditCardService } from '@/domains/payment/services/credit-card.service';
import { ApproveBankTransferInput } from '@/domains/payment/services/dto/approve-bank-transfer.input';
import { ApproveBankTransferOutput } from '@/domains/payment/services/dto/approve-bank-transfer.output';
import { BankTransferOutput } from '@/domains/payment/services/dto/bank-transfer.output';
import { CreateBankTransferInput } from '@/domains/payment/services/dto/create-bank-transfer.input';
import { CreateChargeInput } from '@/domains/payment/services/dto/create-charge.input';
import { CreateChargeOutput } from '@/domains/payment/services/dto/create-charge.output';
import { RetrieveChargeInput } from '@/domains/payment/services/dto/retrieve-charge.input';
import { RetrieveChargeOutput } from '@/domains/payment/services/dto/retrieve-charge.output';
import type { IPaymentService } from '@/domains/payment/services/interfaces/payment.service.interface';
import { PaymentValidationService } from '@/domains/payment/services/payment-validation.service';
import { PaymentStatus } from '@/enums/payment-status.enum';
import { PaymentDto } from '@/infrastructures/database/dto/payment.dto';
import { AppLoggerService } from '@/modules/logger/services/app-logger.service';
import { IOmiseService } from '@/modules/omise/services/interfaces/omise.service.interface';
import { OmiseService } from '@/modules/omise/services/omise.service';
import { WebhookService } from '@/modules/webhook/services/webhook.service';

/**
 * PaymentService
 *
 * Orchestration layer following Clean Architecture
 * Coordinates between specialized services:
 * - CreditCardService: Omise credit card operations
 * - PaymentValidationService: Payment validation logic
 * - BankTransferService: Bank transfer operations
 */
@Injectable()
export class PaymentService implements IPaymentService {
  static readonly TOKEN = Symbol('PaymentService');

  constructor(
    private readonly logger: AppLoggerService,
    @Inject(CreditCardService.TOKEN)
    private readonly creditCardService: CreditCardService,
    @Inject(PaymentValidationService.TOKEN)
    private readonly paymentValidationService: PaymentValidationService,
    @Inject(BankTransferService.TOKEN)
    private readonly bankTransferService: BankTransferService,
    @Inject(PaymentRepository.TOKEN)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(OmiseService.TOKEN)
    private readonly omiseService: IOmiseService,
    @Inject(WebhookService.TOKEN)
    private readonly webhookService: WebhookService,
  ) {}

  /**
   * Helper: Handle catch block errors with logging
   */
  private handleCatchError<TInput, TOutput>(
    error: unknown,
    context: string,
    input: TInput,
    errorCode: ErrorCode,
  ): ResponseOutputWithContent<TInput, TOutput> {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const stackTrace = error instanceof Error ? error.stack : undefined;

    this.logger.error(
      `${context}: ${errorMessage}`,
      stackTrace,
      PaymentService.name,
    );

    return ResponseOutputWithContent.failWithContent(errorCode, input);
  }

  /**
   * Helper: Log and throw error (for methods that don't return ResponseOutput)
   */
  private logAndThrowError(error: unknown, context: string): never {
    this.logger.error(
      `${context}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error.stack : undefined,
      PaymentService.name,
    );
    throw error;
  }

  async createCharge(
    input: CreateChargeInput,
  ): Promise<ResponseOutputWithContent<CreateChargeInput, CreateChargeOutput>> {
    this.logger.debug(
      `Creating charge: orderId=${input.orderId}`,
      PaymentService.name,
    );

    try {
      // 1-5. Validate and prepare payment (order, amount)
      const validationResult =
        await this.paymentValidationService.validateAndPreparePayment(
          input,
          input,
        );

      if (!validationResult.isValid) {
        return validationResult.errorResponse as ResponseOutputWithContent<
          CreateChargeInput,
          CreateChargeOutput
        >;
      }

      // TypeScript type narrowing - after isValid check, we know it's the valid branch
      const validResult = validationResult as {
        isValid: true;
        order: {
          id: string;
          totalAmount: number;
          userId: string;
          couponId: string | null;
        };
        orderItems: { id: string; courseId: string }[];
        finalAmount: number;
      };
      const { order, orderItems, finalAmount } = validResult;

      // 6. Create Omise Token from card details
      let tokenId: string;
      try {
        this.logger.debug(
          `Creating Omise token for order: ${order.id}`,
          PaymentService.name,
        );

        const tokenResult = await this.omiseService.createToken({
          cardNumber: input.cardNumber,
          cardName: input.cardName,
          expirationMonth: input.expirationMonth,
          expirationYear: input.expirationYear,
          securityCode: input.securityCode,
          city: input.city,
          postalCode: input.postalCode,
        });

        this.logger.log(
          `Token created successfully: ${tokenResult.id}`,
          PaymentService.name,
        );

        tokenId = tokenResult.id;
      } catch (error: unknown) {
        // Handle error from token creation
        if (error instanceof BadRequestException) {
          // Card validation errors
          const errorMessage = error.message.toLowerCase();

          let errorCode: ErrorCode;
          if (
            errorMessage.includes('invalid card') ||
            errorMessage.includes('invalid_number')
          ) {
            errorCode = ERROR_CODES.PAYMENT.INVALID_CARD;
          } else if (errorMessage.includes('expired')) {
            errorCode = ERROR_CODES.PAYMENT.EXPIRED_CARD;
          } else if (
            errorMessage.includes('cvv') ||
            errorMessage.includes('security_code')
          ) {
            errorCode = ERROR_CODES.PAYMENT.INVALID_CVV;
          } else if (errorMessage.includes('insufficient')) {
            errorCode = ERROR_CODES.PAYMENT.INSUFFICIENT_FUND;
          } else if (
            errorMessage.includes('declined') ||
            errorMessage.includes('rejected')
          ) {
            errorCode = ERROR_CODES.PAYMENT.CARD_DECLINED;
          } else {
            errorCode = ERROR_CODES.PAYMENT.INVALID_CARD;
          }

          return ResponseOutputWithContent.failWithContent(errorCode, input);
        }

        // Internal server errors
        return this.handleCatchError<CreateChargeInput, CreateChargeOutput>(
          error,
          'Failed to create payment token',
          input,
          ERROR_CODES.PAYMENT.CREATE_TOKEN_ERROR,
        );
      }

      // 7. Create charge with Omise via CreditCardService (using token)
      const chargeResult = await this.creditCardService.createCharge({
        amount: finalAmount,
        token: tokenId,
        description: input.description ?? `Payment for order ${order.id}`,
        orderId: order.id,
      });

      // 8. Create or update enrollments from order items if payment is successful
      if (chargeResult.status === PaymentStatus.SUCCESSFUL) {
        await Promise.all(
          orderItems.map(item =>
            this.paymentRepository.createOrUpdateEnrollment(
              order.userId,
              item.courseId,
              chargeResult.paymentId,
            ),
          ),
        );
        this.logger.log(
          `Created or updated ${orderItems.length} enrollments for order ${order.id}`,
          PaymentService.name,
        );

        // 9. Update order status to successful
        await this.paymentRepository.updateOrderStatus(order.id, 'successful');
        this.logger.log(
          `Order status updated to successful: ${order.id}`,
          PaymentService.name,
        );

        // 10. Skip coupon usage increment (feature not implemented yet)
        // TODO: Coupon feature - increment usage when implemented
        // if (order.couponId) {
        //   await this.couponRepository.incrementUsage(order.couponId);
        //   this.logger.log(
        //     `Coupon usage incremented: ${order.couponId}`,
        //     PaymentService.name,
        //   );
        // }
      }

      // 11. Get payment record for output
      const payment = await this.paymentRepository.findOneById(
        chargeResult.paymentId,
      );

      if (!payment) {
        throw new Error(`Payment not found: ${chargeResult.paymentId}`);
      }

      // 12. Create output
      const output = CreateChargeOutput.create({
        id: payment.id,
        enrollmentId: null, // No longer using single enrollment
        omiseChargeId: chargeResult.omiseChargeId,
        amount: chargeResult.amount,
        currency: chargeResult.currency,
        status: payment.status,
        paymentMethod: payment.paymentType,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      });

      this.logger.log(
        `Charge created successfully: ${payment.id}`,
        PaymentService.name,
      );

      return ResponseOutputWithContent.successWithContent(input, output);
    } catch (error) {
      return this.handleCatchError<CreateChargeInput, CreateChargeOutput>(
        error,
        'Failed to create charge',
        input,
        ERROR_CODES.PAYMENT.CREATE_CHARGE_ERROR,
      );
    }
  }

  async retrieveCharge(
    input: RetrieveChargeInput,
  ): Promise<
    ResponseOutputWithContent<RetrieveChargeInput, RetrieveChargeOutput>
  > {
    this.logger.debug(
      `Retrieving charge: ${input.chargeId}`,
      PaymentService.name,
    );

    // Delegate to CreditCardService
    return this.creditCardService.retrieveCharge(input);
  }

  // ==================== BANK TRANSFER METHODS ====================

  async createBankTransferPayment(
    file: Express.Multer.File,
    input: CreateBankTransferInput,
  ): Promise<
    ResponseOutputWithContent<CreateBankTransferInput, BankTransferOutput>
  > {
    this.logger.debug(
      `Creating bank transfer payment: orderId=${input.orderId}`,
      PaymentService.name,
    );

    try {
      // 1-5. Validate and prepare payment (order, amount)
      const validationResult =
        await this.paymentValidationService.validateAndPreparePayment(
          input,
          input,
        );

      if (!validationResult.isValid) {
        return validationResult.errorResponse as ResponseOutputWithContent<
          CreateBankTransferInput,
          BankTransferOutput
        >;
      }

      // TypeScript type narrowing - after isValid check, we know it's the valid branch
      const validResult = validationResult as {
        isValid: true;
        order: {
          id: string;
          totalAmount: number;
          userId: string;
          couponId: string | null;
        };
        orderItems: { id: string; courseId: string }[];
        finalAmount: number;
      };
      const { order, orderItems, finalAmount } = validResult;

      // 6. Upload payment slip (use orderId as identifier)
      const uploadResult = await this.bankTransferService.uploadPaymentSlip(
        file,
        order.id,
      );

      // 7. Create payment record
      const payment = await this.paymentRepository.createPayment({
        paymentType: 'Bank Transfer',
        status: PaymentStatus.PENDING, // รอ admin อนุมัติ
        orderId: order.id,
        slipImage: uploadResult.url,
      });

      // 8. Skip enrollment creation - will be created when payment is approved
      this.logger.log(
        `Payment created (PENDING), waiting for approval. Order: ${order.id}`,
        PaymentService.name,
      );

      // 9. Get course details for webhook
      const courseIds = orderItems.map(item => item.courseId);
      const courses = await this.paymentRepository.findCoursesByIds(courseIds);

      // 10. Send webhook to n8n (async, non-blocking)
      this.webhookService
        .sendBankTransferCreated({
          paymentId: payment.id,
          orderId: order.id,
          userId: order.userId,
          amount: finalAmount,
          slipUrl: uploadResult.url,
          courses: courses.map(course => ({
            courseId: course.id,
            title: course.title,
          })),
        })
        .catch(() => {
          // Error already logged in WebhookService
        });

      // 11. Create output
      const output = BankTransferOutput.create({
        id: payment.id,
        enrollmentId: null, // No longer using single enrollment
        paymentType: 'Bank Transfer',
        amount: finalAmount,
        status: payment.status,
        slipImage: payment.slipImage ?? '',
        couponId: order.couponId,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      });

      this.logger.log(
        `Bank transfer payment created successfully: ${payment.id}`,
        PaymentService.name,
      );

      return ResponseOutputWithContent.successWithContent(
        input,
        output,
        HttpStatus.CREATED,
      );
    } catch (error) {
      return this.handleCatchError<CreateBankTransferInput, BankTransferOutput>(
        error,
        'Failed to create bank transfer payment',
        input,
        ERROR_CODES.PAYMENT.BANK_TRANSFER_CREATE_ERROR,
      );
    }
  }

  // ==================== GENERIC PAYMENT METHODS ====================

  async getPayments(filters: {
    type?: string;
    status?: string;
  }): Promise<PaymentDto[]> {
    this.logger.debug(
      `Getting payments with filters: ${JSON.stringify(filters)}`,
      PaymentService.name,
    );

    try {
      // Type assertion needed due to TypeScript strict mode false positive

      const payments = await this.paymentRepository.findMany({
        where: {
          ...(filters.type !== undefined &&
            filters.type !== null &&
            filters.type.trim() !== '' && { paymentType: filters.type }),
          ...(filters.status !== undefined &&
            filters.status !== null &&
            filters.status.trim() !== '' && { status: filters.status }),
        },
        orderBy: { createdAt: 'desc' },
      });
      return payments;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const stackTrace = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to get payments: ${errorMessage}`,
        stackTrace,
        PaymentService.name,
      );

      // Return empty array instead of throwing to maintain consistency
      return [];
    }
  }

  async getMyPayments(userId: string): Promise<PaymentDto[]> {
    this.logger.debug(
      `Getting payments for user: ${userId}`,
      PaymentService.name,
    );

    try {
      // Type assertion needed due to TypeScript strict mode false positive

      const payments = await this.paymentRepository.findByUserId(userId);
      return payments;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const stackTrace = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to get my payments: ${errorMessage}`,
        stackTrace,
        PaymentService.name,
      );

      // Return empty array instead of throwing to maintain consistency
      // with getPayments method behavior
      return [];
    }
  }

  /**
   * Approve or reject bank transfer payment
   * Creates enrollments on approval (matching credit card flow)
   */
  async approveBankTransferPayment(
    input: ApproveBankTransferInput,
  ): Promise<
    ResponseOutputWithContent<
      ApproveBankTransferInput,
      ApproveBankTransferOutput
    >
  > {
    try {
      // 1. Find payment by ID
      const payment = await this.paymentRepository.findOneById(input.paymentId);

      // 2. Validate payment exists
      if (!payment) {
        return ResponseOutputWithContent.failWithContent(
          ERROR_CODES.PAYMENT.PAYMENT_NOT_FOUND,
          input,
        );
      }

      // 3. Validate payment is PENDING
      if (payment.status !== PaymentStatus.PENDING.toString()) {
        return ResponseOutputWithContent.failWithContent(
          ERROR_CODES.PAYMENT.PAYMENT_ALREADY_PROCESSED,
          input,
        );
      }

      // 4. Validate payment is Bank Transfer
      if (payment.paymentType !== 'Bank Transfer') {
        return ResponseOutputWithContent.failWithContent(
          ERROR_CODES.PAYMENT.INVALID_PAYMENT_TYPE,
          input,
        );
      }

      // 5. Validate reason if rejected
      if (
        input.approved === false &&
        (input.reason === null ||
          input.reason === undefined ||
          input.reason.trim() === '')
      ) {
        return ResponseOutputWithContent.failWithContent(
          ERROR_CODES.PAYMENT.APPROVAL_REASON_REQUIRED,
          input,
        );
      }

      if (input.approved) {
        // APPROVE FLOW
        this.logger.log(
          `Approving bank transfer payment: ${input.paymentId}`,
          PaymentService.name,
        );

        // 6. Update payment status to SUCCESSFUL
        await this.paymentRepository.updatePaymentStatus(
          input.paymentId,
          PaymentStatus.SUCCESSFUL as string,
        );

        // 7. Get order
        if (payment.orderId === null || payment.orderId === undefined) {
          throw new Error(`Payment ${input.paymentId} has no order ID`);
        }
        const order = await this.paymentRepository.findOrderById(
          payment.orderId,
        );
        if (!order) {
          throw new Error(`Order not found: ${payment.orderId}`);
        }

        // 8. Get order items
        const orderItems = await this.paymentRepository.findOrderItemsByOrderId(
          payment.orderId,
        );

        // 9. Create enrollments (same as credit card flow)
        await Promise.all(
          orderItems.map(item =>
            this.paymentRepository.createOrUpdateEnrollment(
              order.userId,
              item.courseId,
              input.paymentId,
            ),
          ),
        );
        this.logger.log(
          `Created ${orderItems.length} enrollments for order ${order.id}`,
          PaymentService.name,
        );

        // 10. Update order status to successful
        await this.paymentRepository.updateOrderStatus(
          payment.orderId,
          'successful',
        );
        this.logger.log(
          `Order status updated to successful: ${order.id}`,
          PaymentService.name,
        );

        // 11. (Optional) Send success notification
        // TODO: Implement notification service
      } else {
        // REJECT FLOW
        this.logger.log(
          `Rejecting bank transfer payment: ${input.paymentId}, reason: ${input.reason}`,
          PaymentService.name,
        );

        // 6. Update payment status to FAILED
        await this.paymentRepository.updatePaymentStatus(
          input.paymentId,
          PaymentStatus.FAILED as string,
        );

        // 7. (Optional) Send rejection notification
        // TODO: Implement notification service
      }

      // 12. Get updated payment
      const updatedPayment = await this.paymentRepository.findOneById(
        input.paymentId,
      );

      if (!updatedPayment) {
        throw new Error(`Payment not found after update: ${input.paymentId}`);
      }

      // 13. Create output
      const output = ApproveBankTransferOutput.create({
        paymentId: updatedPayment.id ?? '',
        status: updatedPayment.status as PaymentStatus,
        orderId: updatedPayment.orderId ?? '',
        approved: input.approved,
        reason: input.reason,
        updatedAt: updatedPayment.updatedAt ?? new Date(),
      });

      this.logger.log(
        `Bank transfer payment ${input.approved ? 'approved' : 'rejected'}: ${input.paymentId}`,
        PaymentService.name,
      );

      return ResponseOutputWithContent.successWithContent(input, output);
    } catch (error) {
      return this.handleCatchError<
        ApproveBankTransferInput,
        ApproveBankTransferOutput
      >(
        error,
        'Failed to approve/reject bank transfer payment',
        input,
        ERROR_CODES.PAYMENT.BANK_TRANSFER_CREATE_ERROR,
      );
    }
  }
}
