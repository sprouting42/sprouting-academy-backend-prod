import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppLoggerService } from '@/modules/logger/services/app-logger.service';

export interface BankTransferWebhookPayload {
  paymentId: string;
  orderId: string;
  userId: string;
  amount: number;
  slipUrl: string;
  courses: Array<{
    courseId: string;
    title: string;
  }>;
}

/**
 * WebhookService
 *
 * Handles sending webhooks to external services (e.g., n8n)
 * Uses built-in fetch API (Node.js 18+)
 */
@Injectable()
export class WebhookService {
  static readonly TOKEN = Symbol('WebhookService');

  private readonly webhookUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLoggerService,
  ) {
    this.webhookUrl = this.configService.get<string>('N8N_WEBHOOK_URL', '');

    if (this.webhookUrl) {
      this.logger.log(
        `Webhook service initialized with URL: ${this.webhookUrl}`,
        WebhookService.name,
      );
    } else {
      this.logger.warn(
        'N8N_WEBHOOK_URL not configured - webhooks will be skipped',
        WebhookService.name,
      );
    }
  }

  /**
   * Send bank transfer payment created webhook to n8n
   * This is a fire-and-forget operation - errors won't block payment flow
   */
  async sendBankTransferCreated(
    payload: BankTransferWebhookPayload,
  ): Promise<void> {
    if (!this.webhookUrl) {
      this.logger.debug(
        'Webhook URL not configured, skipping webhook send',
        WebhookService.name,
      );
      return;
    }

    this.logger.debug(
      `Sending bank transfer webhook for payment: ${payload.paymentId}`,
      WebhookService.name,
    );

    try {
      const webhookPayload = {
        event: 'payment.bank_transfer.created',
        timestamp: new Date().toISOString(),
        data: payload,
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (!response.ok) {
        const errorText = await response
          .text()
          .catch(() => 'Unable to read response');
        throw new Error(
          `Webhook failed with status ${response.status}: ${errorText}`,
        );
      }

      this.logger.log(
        `Webhook sent successfully for payment: ${payload.paymentId}`,
        WebhookService.name,
      );
    } catch (error) {
      // Don't throw - we don't want to break payment flow if webhook fails
      this.logger.error(
        `Failed to send webhook for payment ${payload.paymentId}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        error instanceof Error ? error.stack : undefined,
        WebhookService.name,
      );
    }
  }
}
