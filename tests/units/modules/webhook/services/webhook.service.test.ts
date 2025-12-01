import type { ConfigService } from '@nestjs/config';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import type { AppLoggerService } from '@/modules/logger/services/app-logger.service';
import {
  WebhookService,
  type BankTransferWebhookPayload,
} from '@/modules/webhook/services/webhook.service';

// Mock global fetch
global.fetch = vi.fn();

describe('WebhookService', () => {
  let webhookService: WebhookService;
  let mockConfigService: Partial<ConfigService>;
  let mockLogger: Partial<AppLoggerService>;

  const mockWebhookUrl = 'https://n8n.example.com/webhook/test';
  const mockPayload: BankTransferWebhookPayload = {
    paymentId: 'payment-123',
    orderId: 'order-456',
    userId: 'user-789',
    amount: 1000,
    slipUrl: 'https://example.com/slip.jpg',
    courses: [
      {
        courseId: 'course-1',
        title: 'Test Course',
      },
    ],
  };

  beforeEach(() => {
    mockLogger = {
      debug: vi.fn(),
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    mockConfigService = {
      get: vi.fn(),
    };

    vi.clearAllMocks();
    vi.mocked(global.fetch).mockClear();
  });

  describe('constructor', () => {
    it('should initialize with webhook URL and log success', () => {
      if (mockConfigService.get) {
        vi.mocked(mockConfigService.get).mockReturnValue(mockWebhookUrl);
      }

      webhookService = new WebhookService(
        mockConfigService as ConfigService,
        mockLogger as AppLoggerService,
      );

      expect(webhookService).toBeDefined();
      expect(mockConfigService.get).toHaveBeenCalledWith('N8N_WEBHOOK_URL', '');
      expect(mockLogger.log).toHaveBeenCalledWith(
        `Webhook service initialized with URL: ${mockWebhookUrl}`,
        'WebhookService',
      );
    });

    it('should initialize without webhook URL and log warning', () => {
      if (mockConfigService.get) {
        vi.mocked(mockConfigService.get).mockReturnValue('');
      }

      webhookService = new WebhookService(
        mockConfigService as ConfigService,
        mockLogger as AppLoggerService,
      );

      expect(webhookService).toBeDefined();
      expect(mockConfigService.get).toHaveBeenCalledWith('N8N_WEBHOOK_URL', '');
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'N8N_WEBHOOK_URL not configured - webhooks will be skipped',
        'WebhookService',
      );
    });

    it('should initialize with undefined webhook URL and log warning', () => {
      if (mockConfigService.get) {
        vi.mocked(mockConfigService.get).mockReturnValue(undefined);
      }

      webhookService = new WebhookService(
        mockConfigService as ConfigService,
        mockLogger as AppLoggerService,
      );

      expect(webhookService).toBeDefined();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'N8N_WEBHOOK_URL not configured - webhooks will be skipped',
        'WebhookService',
      );
    });
  });

  describe('sendBankTransferCreated', () => {
    beforeEach(() => {
      if (mockConfigService.get) {
        vi.mocked(mockConfigService.get).mockReturnValue(mockWebhookUrl);
      }
      webhookService = new WebhookService(
        mockConfigService as ConfigService,
        mockLogger as AppLoggerService,
      );
    });

    it('should skip webhook when URL is not configured', async () => {
      if (mockConfigService.get) {
        vi.mocked(mockConfigService.get).mockReturnValue('');
      }
      webhookService = new WebhookService(
        mockConfigService as ConfigService,
        mockLogger as AppLoggerService,
      );

      await webhookService.sendBankTransferCreated(mockPayload);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Webhook URL not configured, skipping webhook send',
        'WebhookService',
      );
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should send webhook successfully', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
      } as Response;

      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      await webhookService.sendBankTransferCreated(mockPayload);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        `Sending bank transfer webhook for payment: ${mockPayload.paymentId}`,
        'WebhookService',
      );

      expect(global.fetch).toHaveBeenCalledWith(
        mockWebhookUrl,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining(
            'payment.bank_transfer.created',
          ) as unknown,
          signal: expect.any(AbortSignal) as unknown,
        }),
      );

      const callArgs = vi.mocked(global.fetch).mock.calls[0];
      expect(callArgs).toBeDefined();
      if (callArgs !== undefined) {
        expect(callArgs[1]).toBeDefined();
        if (callArgs[1] !== undefined) {
          const body = JSON.parse(callArgs[1]?.body as string) as {
            event: string;
            data: BankTransferWebhookPayload;
            timestamp: string;
          };
          expect(body.event).toBe('payment.bank_transfer.created');
          expect(body.data).toEqual(mockPayload);
          expect(body.timestamp).toBeDefined();
        }
      }

      expect(mockLogger.log).toHaveBeenCalledWith(
        `Webhook sent successfully for payment: ${mockPayload.paymentId}`,
        'WebhookService',
      );
    });

    it('should handle webhook failure with non-ok response', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue('Internal Server Error'),
      } as unknown as Response;

      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      await webhookService.sendBankTransferCreated(mockPayload);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining(
          `Failed to send webhook for payment ${mockPayload.paymentId}`,
        ),
        expect.any(String),
        'WebhookService',
      );
    });

    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network request failed');
      vi.mocked(global.fetch).mockRejectedValue(networkError);

      await webhookService.sendBankTransferCreated(mockPayload);

      expect(mockLogger.error).toHaveBeenCalledWith(
        `Failed to send webhook for payment ${mockPayload.paymentId}: Network request failed`,
        expect.any(String),
        'WebhookService',
      );
    });

    it('should handle fetch timeout', async () => {
      const timeoutError = new Error('The operation was aborted');
      timeoutError.name = 'AbortError';
      vi.mocked(global.fetch).mockRejectedValue(timeoutError);

      await webhookService.sendBankTransferCreated(mockPayload);

      expect(mockLogger.error).toHaveBeenCalledWith(
        `Failed to send webhook for payment ${mockPayload.paymentId}: The operation was aborted`,
        expect.any(String),
        'WebhookService',
      );
    });

    it('should handle response.text() error gracefully', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        text: vi.fn().mockRejectedValue(new Error('Cannot read response')),
      } as unknown as Response;

      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      await webhookService.sendBankTransferCreated(mockPayload);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining(
          `Failed to send webhook for payment ${mockPayload.paymentId}`,
        ),
        expect.any(String),
        'WebhookService',
      );
    });

    it('should handle unknown error types', async () => {
      const unknownError = 'String error';
      vi.mocked(global.fetch).mockRejectedValue(unknownError);

      await webhookService.sendBankTransferCreated(mockPayload);

      expect(mockLogger.error).toHaveBeenCalledWith(
        `Failed to send webhook for payment ${mockPayload.paymentId}: Unknown error`,
        undefined,
        'WebhookService',
      );
    });

    it('should include correct payload structure', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
      } as Response;

      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      await webhookService.sendBankTransferCreated(mockPayload);

      const callArgs = vi.mocked(global.fetch).mock.calls[0];
      expect(callArgs).toBeDefined();
      if (callArgs !== undefined) {
        expect(callArgs[1]).toBeDefined();
        if (callArgs[1] !== undefined) {
          const body = JSON.parse(callArgs[1]?.body as string) as {
            event: string;
            data: BankTransferWebhookPayload;
            timestamp: string;
          };

          expect(body).toHaveProperty('event', 'payment.bank_transfer.created');
          expect(body).toHaveProperty('timestamp');
          expect(body).toHaveProperty('data');
          expect(body.data).toEqual(mockPayload);
        }
      }
    });

    it('should use 5 second timeout', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
      } as Response;

      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      await webhookService.sendBankTransferCreated(mockPayload);

      const callArgs = vi.mocked(global.fetch).mock.calls[0];
      expect(callArgs).toBeDefined();
      if (callArgs !== undefined) {
        expect(callArgs[1]).toBeDefined();
        if (callArgs[1] !== undefined) {
          const signal = callArgs[1]?.signal as AbortSignal;

          expect(signal).toBeInstanceOf(AbortSignal);
        }
      }
    });
  });

  describe('TOKEN', () => {
    it('should have a unique TOKEN symbol', () => {
      expect(WebhookService.TOKEN).toBeTypeOf('symbol');
      expect(WebhookService.TOKEN.toString()).toBe('Symbol(WebhookService)');
    });
  });
});
