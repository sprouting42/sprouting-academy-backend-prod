import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Express } from 'express-serve-static-core';

import { BaseController } from '@/common/controllers/base.controller';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CurrentLanguage } from '@/common/decorators/language.decorator';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { ResponseContent } from '@/common/response/response-content';
import { ResponseOutputWithContent } from '@/common/response/response-output';
import { API_CONTROLLER_CONFIG } from '@/constants/api-controller';
import { ApproveBankTransferRequestBody } from '@/domains/payment/controller/contracts/approve-bank-transfer.request';
import { BankTransferResponse } from '@/domains/payment/controller/contracts/bank-transfer.response';
import { CreateBankTransferRequestBody } from '@/domains/payment/controller/contracts/create-bank-transfer.request';
import { CreateChargeRequestBody } from '@/domains/payment/controller/contracts/create-charge.request';
import { CreateChargeResponse } from '@/domains/payment/controller/contracts/create-charge.response';
import { RetrieveChargeRequestParams } from '@/domains/payment/controller/contracts/retrieve-charge.request';
import { RetrieveChargeResponse } from '@/domains/payment/controller/contracts/retrieve-charge.response';
import { ApiDocPaymentCreateChargeDoc } from '@/domains/payment/controller/docs/payment-create-charge';
import { ApiDocPaymentRetrieveChargeDoc } from '@/domains/payment/controller/docs/payment-retrieve-charge';
import { ApproveBankTransferOutput } from '@/domains/payment/services/dto/approve-bank-transfer.output';
import { IPaymentService } from '@/domains/payment/services/interfaces/payment.service.interface';
import { PaymentService } from '@/domains/payment/services/payment.service';
import { DEFAULT_LANGUAGE, Language } from '@/enums/language.enum';

@UseGuards(AuthenticationGuard, RolesGuard)
@ApiTags(API_CONTROLLER_CONFIG.PAYMENT.TAG)
@Controller(API_CONTROLLER_CONFIG.PAYMENT.PREFIX)
export class PaymentController extends BaseController {
  constructor(
    @Inject(PaymentService.TOKEN)
    private readonly paymentService: IPaymentService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  @Post('charge')
  @ApiDocPaymentCreateChargeDoc()
  @HttpCode(HttpStatus.CREATED)
  async createCharge(
    @CurrentUser() user: { userId: string },
    @Body() body: CreateChargeRequestBody,
    @CurrentLanguage() language: Language,
  ): Promise<ResponseContent<CreateChargeResponse>> {
    try {
      const result = await this.paymentService.createCharge({
        userId: user.userId,
        orderId: body.orderId,
        cardNumber: body.cardNumber,
        cardName: body.cardName,
        expirationMonth: body.expirationMonth,
        expirationYear: body.expirationYear,
        securityCode: body.securityCode,
        city: body.city,
        postalCode: body.postalCode,
        description: body.description,
      });

      return this.actionResponse<CreateChargeResponse, CreateChargeRequestBody>(
        result,
      );
    } catch (error) {
      return this.actionResponseError(language, error, body);
    }
  }

  @Get('charge/:chargeId')
  @ApiDocPaymentRetrieveChargeDoc()
  @HttpCode(HttpStatus.OK)
  async retrieveCharge(
    @Param() params: RetrieveChargeRequestParams,
    @CurrentLanguage() language: Language,
  ): Promise<ResponseContent<RetrieveChargeResponse>> {
    try {
      const result = await this.paymentService.retrieveCharge({
        chargeId: params.chargeId,
      });

      return this.actionResponse<
        RetrieveChargeResponse,
        RetrieveChargeRequestParams
      >(result);
    } catch (error) {
      return this.actionResponseError(language, error, params);
    }
  }

  // ==================== BANK TRANSFER ENDPOINTS ====================

  @Post('bank-transfer')
  @ApiOperation({
    summary: 'Create bank transfer payment',
    description:
      'Upload payment slip image and create bank transfer payment record (requires authentication)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['orderId', 'file'],
      properties: {
        orderId: {
          type: 'string',
          format: 'uuid',
          description: 'Order ID',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Payment slip image (jpg, png, max 5MB)',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async createBankTransferPayment(
    @CurrentUser() user: { userId: string },
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: CreateBankTransferRequestBody,
    @CurrentLanguage() language: Language,
  ): Promise<ResponseContent<BankTransferResponse>> {
    try {
      if (!file) {
        throw new BadRequestException('Payment slip file is required');
      }

      const result = await this.paymentService.createBankTransferPayment(file, {
        userId: user.userId,
        orderId: body.orderId,
        slipUrl: '', // Will be set by service
      });

      return this.actionResponse<
        BankTransferResponse,
        CreateBankTransferRequestBody
      >(result);
    } catch (error) {
      const statusCode =
        error instanceof BadRequestException
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.INTERNAL_SERVER_ERROR;
      return this.actionResponseError(
        language,
        error,
        {
          ...body,
          file: file?.originalname,
        },
        statusCode,
      );
    }
  }

  @Get('bank-transfer')
  @ApiOperation({
    summary: 'Get bank transfer payments',
    description:
      'Get all bank transfer payments with optional status filter (requires authentication)',
  })
  @HttpCode(HttpStatus.OK)
  async getBankTransfers(
    @Query('status') status?: string,
    @CurrentLanguage() language: Language = DEFAULT_LANGUAGE,
  ): Promise<ResponseContent<BankTransferResponse[]>> {
    try {
      const payments = await this.paymentService.getPayments({
        type: 'Bank Transfer',
        status,
      });

      return this.actionResponse(
        ResponseOutputWithContent.successWithContent({}, payments),
      );
    } catch (error) {
      return this.actionResponseError(language, error, { status });
    }
  }

  @Post('webhook/bank-transfer/approve')
  @ApiOperation({
    summary: 'Approve or reject bank transfer payment (webhook)',
    description:
      'Called by n8n to approve or reject bank transfer payment. Requires webhook secret in x-webhook-secret header.',
  })
  @HttpCode(HttpStatus.OK)
  async approveBankTransferPayment(
    @Body() body: ApproveBankTransferRequestBody,
    @Query('paymentId') paymentId: string,
    @Headers('x-webhook-secret') secret: string,
    @CurrentLanguage() language: Language = DEFAULT_LANGUAGE,
  ): Promise<ResponseContent<ApproveBankTransferOutput>> {
    try {
      // Verify webhook secret
      const expectedSecret =
        this.configService.get<string>('N8N_WEBHOOK_SECRET');
      if (
        expectedSecret === null ||
        expectedSecret === undefined ||
        secret === null ||
        secret === undefined ||
        secret.length !== expectedSecret.length ||
        secret !== expectedSecret
      ) {
        throw new UnauthorizedException('Invalid webhook secret');
      }

      const result = await this.paymentService.approveBankTransferPayment({
        paymentId,
        approved: body.approved,
        reason: body.reason,
      });

      return this.actionResponse<
        ApproveBankTransferOutput,
        ApproveBankTransferRequestBody
      >(result);
    } catch (error) {
      return this.actionResponseError(language, error, body);
    }
  }

  // ==================== GENERIC PAYMENT MANAGEMENT ====================

  @Get()
  @ApiOperation({
    summary: 'Get all payments',
    description:
      'Get all payments with optional filters (payment type, status)',
  })
  @HttpCode(HttpStatus.OK)
  async getPayments(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @CurrentLanguage() language: Language = DEFAULT_LANGUAGE,
  ): Promise<ResponseContent<unknown[]>> {
    try {
      const payments = await this.paymentService.getPayments({ type, status });

      return this.actionResponse(
        ResponseOutputWithContent.successWithContent({}, payments),
      );
    } catch (error) {
      return this.actionResponseError(language, error, { type, status });
    }
  }

  @Get('my-payments')
  @ApiOperation({
    summary: 'Get my payments',
    description:
      'Get all payments for the authenticated user (requires authentication)',
  })
  @HttpCode(HttpStatus.OK)
  async getMyPayments(
    @CurrentUser() user: { userId: string },
    @CurrentLanguage() language: Language = DEFAULT_LANGUAGE,
  ): Promise<ResponseContent<unknown[]>> {
    try {
      const payments = await this.paymentService.getMyPayments(user.userId);

      return this.actionResponse(
        ResponseOutputWithContent.successWithContent({}, payments),
      );
    } catch (error) {
      return this.actionResponseError(language, error, {
        userId: user.userId,
      });
    }
  }
}
