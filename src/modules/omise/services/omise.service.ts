import {
  Injectable,
  OnModuleInit,
  InternalServerErrorException,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import Omise from 'omise';

import { CURRENCY, SATANG_MULTIPLIER } from '@/constants/currency';
import { ICharge } from '@/domains/payment/services/interfaces/payment.interface';
import { EnvVariables } from '@/modules/config/dto/config.dto';
import { AppLoggerService } from '@/modules/logger/services/app-logger.service';
import type { CreateTokenInput } from '@/modules/omise/services/interfaces/create-token.input';
import type { CreateTokenOutput } from '@/modules/omise/services/interfaces/create-token.output';
import { IOmiseService } from '@/modules/omise/services/interfaces/omise.service.interface';

@Injectable()
export class OmiseService implements IOmiseService, OnModuleInit {
  static readonly TOKEN = Symbol('OmiseService');
  private readonly omise: Omise.IOmise;

  constructor(private readonly logger: AppLoggerService) {
    const secretKey = EnvVariables.instance.OMISE_SECRET_KEY;
    const publicKey = EnvVariables.instance.OMISE_PUBLIC_KEY;

    if (!secretKey || !publicKey) {
      throw new Error('Omise API keys must be provided');
    }

    this.omise = Omise({
      secretKey,
      publicKey,
    });
  }

  onModuleInit(): void {
    this.logger.log(
      'Omise service initialized successfully',
      OmiseService.name,
    );
  }

  /**
   * Get Omise Public Key for frontend token creation
   * This key is safe to expose to frontend clients
   * @returns Omise public key
   */
  getPublicKey(): string {
    return EnvVariables.instance.OMISE_PUBLIC_KEY;
  }

  /**
   * Create Omise token from card details
   * This method creates a token server-side using Omise SDK
   * @param input - Card details for token creation
   * @returns Promise<CreateTokenOutput>
   * @throws InternalServerErrorException if token creation fails
   */
  async createToken(input: CreateTokenInput): Promise<CreateTokenOutput> {
    this.logger.debug(
      `Creating token for card ending in ${input.cardNumber.slice(-4)}`,
      OmiseService.name,
    );

    try {
      const cardData: {
        name: string;
        number: string;
        expiration_month: number;
        expiration_year: number;
        security_code: string;
        city: string;
        postal_code: string;
      } = {
        name: input.cardName,
        number: input.cardNumber,
        expiration_month: input.expirationMonth,
        expiration_year: input.expirationYear,
        security_code: input.securityCode,
        city: input.city?.trim() ?? '',
        postal_code: input.postalCode?.trim() ?? '',
      };

      const res = await this.omise.tokens.create({
        card: cardData,
      });

      this.logger.log(
        `Token created successfully: ${res.id}`,
        OmiseService.name,
      );

      // Type-safe access to optional properties
      const cardWithFunding = res.card as Omise.Cards.ICard & {
        funding?: string;
      };
      const tokenWithCreated = res as Omise.Tokens.IToken & {
        created?: string;
      };

      return {
        id: res.id,
        livemode: res.livemode ?? false,
        location: res.location ?? '',
        card: {
          id: res.card.id,
          lastDigits: res.card.last_digits,
          brand: res.card.brand,
          name: res.card.name,
          expirationMonth: res.card.expiration_month,
          expirationYear: res.card.expiration_year,
          fingerprint: res.card.fingerprint,
          funding: cardWithFunding.funding ?? 'credit',
        },
        created: tokenWithCreated.created ?? new Date().toISOString(),
      };
    } catch (error) {
      this.handleOmiseError(error, 'create token');
    }
  }

  /**
   * Create a charge with Omise
   * @param amount - Amount in THB
   * @param token - Card token from Omise.js
   * @param description - Optional charge description
   * @returns Promise<ICharge>
   * @throws InternalServerErrorException if charge creation fails
   */
  async createCharge(
    amount: number,
    token: string,
    description?: string,
  ): Promise<ICharge> {
    this.logger.debug(
      `Creating charge: amount=${amount} THB, token=${token.substring(0, 10)}...`,
      OmiseService.name,
    );

    try {
      const res = await this.omise.charges.create({
        amount: this.toSatang(amount),
        currency: CURRENCY,
        card: token,
        description,
      });

      this.logger.log(
        `Charge created successfully: ${res.id}`,
        OmiseService.name,
      );
      return this.mapToICharge(res);
    } catch (error) {
      this.handleOmiseError(error, 'create charge');
    }
  }

  /**
   * Retrieve a charge by ID
   * @param chargeId - Omise charge ID
   * @returns Promise<ICharge>
   * @throws InternalServerErrorException if retrieval fails
   */
  async retrieveCharge(chargeId: string): Promise<ICharge> {
    this.logger.debug(`Retrieving charge: ${chargeId}`, OmiseService.name);

    try {
      const res = await this.omise.charges.retrieve(chargeId);
      this.logger.log(
        `Charge retrieved successfully: ${chargeId}`,
        OmiseService.name,
      );
      return this.mapToICharge(res);
    } catch (error) {
      this.handleOmiseError(error, 'retrieve charge');
    }
  }

  /**
   * Map Omise error code to appropriate HTTP exception
   * @param omiseErrorCode - Omise error code (e.g., "invalid_card", "expired_card")
   * @param errorMessage - Error message from Omise
   * @param context - Context message for the error
   * @returns Appropriate HTTP exception
   */
  private mapOmiseErrorToException(
    omiseErrorCode: string | undefined,
    errorMessage: string,
    context: string,
  ): HttpException {
    // Common Omise error codes
    // Reference: https://www.omise.co/api-errors

    if (omiseErrorCode === undefined || omiseErrorCode === '') {
      return new InternalServerErrorException(
        `Failed to ${context}: ${errorMessage}`,
      );
    }

    const errorCodeLower = omiseErrorCode.toLowerCase();

    // Card validation errors (BadRequest)
    if (
      errorCodeLower.includes('invalid_card') ||
      errorCodeLower.includes('invalid_number')
    ) {
      return new BadRequestException(
        `Invalid card information: ${errorMessage}`,
      );
    }

    if (errorCodeLower.includes('expired_card')) {
      return new BadRequestException(`Card expired: ${errorMessage}`);
    }

    if (
      errorCodeLower.includes('invalid_cvv') ||
      errorCodeLower.includes('invalid_security_code')
    ) {
      return new BadRequestException(`Invalid CVV: ${errorMessage}`);
    }

    if (errorCodeLower.includes('insufficient_fund')) {
      return new BadRequestException(`Insufficient funds: ${errorMessage}`);
    }

    if (
      errorCodeLower.includes('declined') ||
      errorCodeLower.includes('rejected')
    ) {
      return new BadRequestException(`Card declined: ${errorMessage}`);
    }

    // API/Network errors (InternalServerError)
    if (
      errorCodeLower.includes('service_unavailable') ||
      errorCodeLower.includes('timeout') ||
      errorCodeLower.includes('network')
    ) {
      return new InternalServerErrorException(
        `Payment service temporarily unavailable: ${errorMessage}`,
      );
    }

    // Default: InternalServerError for unknown errors
    return new InternalServerErrorException(
      `Failed to ${context}: [${omiseErrorCode}] ${errorMessage}`,
    );
  }

  /**
   * Handle Omise errors and throw appropriate HTTP exception
   * @param error - The error object from Omise SDK
   * @param context - Context message for the error (e.g., "create charge", "retrieve charge")
   * @throws HttpException (BadRequestException or InternalServerErrorException)
   */
  private handleOmiseError(error: unknown, context: string): never {
    // Omise SDK may throw different error types
    let errorMessage = 'Unknown error';
    let errorCode: string | undefined;
    let stackTrace: string | undefined;

    if (error instanceof Error) {
      errorMessage = error.message;
      stackTrace = error.stack;
    } else if (
      error !== null &&
      error !== undefined &&
      typeof error === 'object'
    ) {
      // Handle Omise error object structure
      const omiseError = error as {
        code?: string;
        message?: string;
        location?: string;
        object?: string;
      };
      errorCode = omiseError.code;
      errorMessage =
        omiseError.message ?? omiseError.code ?? JSON.stringify(error);
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    const fullErrorMessage =
      errorCode !== null && errorCode !== undefined && errorCode !== ''
        ? `[${errorCode}] ${errorMessage}`
        : errorMessage;

    this.logger.error(
      `Failed to ${context}: ${fullErrorMessage}`,
      stackTrace ?? JSON.stringify(error),
      OmiseService.name,
    );

    // Use mapOmiseErrorToException to determine appropriate exception
    throw this.mapOmiseErrorToException(errorCode, errorMessage, context);
  }

  /**
   * Convert THB to satang (smallest unit)
   * @param amount - Amount in THB
   * @returns Amount in satang
   */
  private toSatang(amount: number): number {
    return Math.round(amount * SATANG_MULTIPLIER);
  }

  /**
   * Convert satang to THB
   * @param amount - Amount in satang
   * @returns Amount in THB
   */
  private toThb(amount: number): number {
    return amount / SATANG_MULTIPLIER;
  }

  /**
   * Map Omise response to ICharge interface
   * @param res - Omise charge response
   * @returns ICharge
   */
  private mapToICharge(res: Omise.Charges.ICharge): ICharge {
    const charge = res;

    return {
      id: charge.id,
      amount: this.toThb(charge.amount),
      currency: charge.currency,
      paid: charge.paid ?? false,
      description: charge.description ?? undefined,
    };
  }
}
