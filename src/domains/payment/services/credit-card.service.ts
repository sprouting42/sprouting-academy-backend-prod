import { Inject, Injectable, HttpStatus } from '@nestjs/common';

import { ERROR_CODES } from '@/common/errors/error-code';
import { ErrorCode } from '@/common/errors/types/error-code.type';
import { ResponseOutputWithContent } from '@/common/response/response-output';
import { IPaymentRepository } from '@/domains/payment/repositories/interfaces/payment.repository.interface';
import { PaymentRepository } from '@/domains/payment/repositories/payment.repository';
import { RetrieveChargeInput } from '@/domains/payment/services/dto/retrieve-charge.input';
import { RetrieveChargeOutput } from '@/domains/payment/services/dto/retrieve-charge.output';
import { PaymentStatus } from '@/enums/payment-status.enum';
import { AppLoggerService } from '@/modules/logger/services/app-logger.service';
import { IOmiseService } from '@/modules/omise/services/interfaces/omise.service.interface';
import { OmiseService } from '@/modules/omise/services/omise.service';

/**
 * CreditCardService
 *
 * Handles all credit card payment operations via Omise
 * - Create charge
 * - Retrieve charge
 */
@Injectable()
export class CreditCardService {
  static readonly TOKEN = Symbol('CreditCardService');

  constructor(
    private readonly logger: AppLoggerService,
    @Inject(OmiseService.TOKEN)
    private readonly omiseService: IOmiseService,
    @Inject(PaymentRepository.TOKEN)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  /**
   * Helper: Get error code with fallback
   */
  private getErrorCode(
    errorCode: ErrorCode | undefined,
    fallbackCode: string,
    fallbackMessage: string,
    fallbackStatusCode = HttpStatus.BAD_REQUEST,
  ): ErrorCode {
    return (
      errorCode ??
      ErrorCode.create({
        code: fallbackCode,
        message: fallbackMessage,
        statusCode: fallbackStatusCode,
      })
    );
  }

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
      CreditCardService.name,
    );

    return ResponseOutputWithContent.failWithContent(errorCode, input);
  }

  /**
   * Create charge with Omise and save payment record
   */
  async createCharge(input: {
    amount: number;
    token: string;
    description: string;
    orderId: string;
  }): Promise<{
    paymentId: string;
    omiseChargeId: string;
    status: PaymentStatus;
    amount: number;
    currency: string;
  }> {
    // Create charge with Omise
    const omiseCharge = await this.omiseService.createCharge(
      input.amount,
      input.token,
      input.description,
    );

    // Determine payment status based on Omise response
    let paymentStatus: PaymentStatus;
    if (omiseCharge.paid === true) {
      paymentStatus = PaymentStatus.SUCCESSFUL;
    } else if (
      omiseCharge.failure_code !== null &&
      omiseCharge.failure_code !== undefined &&
      omiseCharge.failure_code !== ''
    ) {
      paymentStatus = PaymentStatus.FAILED;
    } else {
      paymentStatus = PaymentStatus.PENDING;
    }

    // Save payment record to database
    const payment = await this.paymentRepository.createPayment({
      paymentType: 'Credit Card',
      status: paymentStatus,
      orderId: input.orderId,
      omiseChargeId: omiseCharge.id,
      slipImage: null,
    });

    this.logger.log(
      `Charge created successfully: ${payment.id}, omiseChargeId: ${omiseCharge.id}`,
      CreditCardService.name,
    );

    return {
      paymentId: payment.id,
      omiseChargeId: omiseCharge.id,
      status: paymentStatus,
      amount: omiseCharge.amount,
      currency: omiseCharge.currency,
    };
  }

  /**
   * Retrieve charge from Omise
   */
  async retrieveCharge(
    input: RetrieveChargeInput,
  ): Promise<
    ResponseOutputWithContent<RetrieveChargeInput, RetrieveChargeOutput>
  > {
    this.logger.debug(
      `Retrieving charge: ${input.chargeId}`,
      CreditCardService.name,
    );

    try {
      // Retrieve from Omise directly
      const omiseCharge = await this.omiseService.retrieveCharge(
        input.chargeId,
      );

      // Create output from Omise data
      let status: PaymentStatus;
      if (omiseCharge.paid === true) {
        status = PaymentStatus.SUCCESSFUL;
      } else if (
        omiseCharge.failure_code !== null &&
        omiseCharge.failure_code !== undefined &&
        omiseCharge.failure_code !== ''
      ) {
        status = PaymentStatus.FAILED;
      } else {
        status = PaymentStatus.PENDING;
      }

      const output = RetrieveChargeOutput.create({
        id: omiseCharge.id,
        enrollmentId: null, // We don't have this mapping anymore
        omiseChargeId: omiseCharge.id,
        amount: omiseCharge.amount,
        currency: omiseCharge.currency,
        status: status,
        paymentMethod: 'Credit Card',
        failureCode: null,
        failureMessage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return ResponseOutputWithContent.successWithContent(input, output);
    } catch (error) {
      return this.handleCatchError<RetrieveChargeInput, RetrieveChargeOutput>(
        error,
        'Failed to retrieve charge',
        input,
        this.getErrorCode(
          ERROR_CODES.PAYMENT?.RETRIEVE_CHARGE_ERROR,
          'PAYMENT_RETRIEVE_CHARGE_ERROR',
          'Failed to retrieve charge',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    }
  }
}
