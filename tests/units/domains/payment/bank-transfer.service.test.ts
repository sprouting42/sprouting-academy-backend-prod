import type { Express } from 'express-serve-static-core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { BankTransferService } from '@/domains/payment/services/bank-transfer.service';
import type { IStorageService } from '@/infrastructures/supabase/interfaces/storage.service.interface';
import type { AppLoggerService } from '@/modules/logger/services/app-logger.service';

// Mock ERROR_CODES to prevent undefined error in error handling
vi.mock('@/common/errors/error-code', async () => {
  const actual = await vi.importActual('@/common/errors/error-code');
  return {
    ...actual,
    ERROR_CODES: {
      PAYMENT: {
        UPLOAD_ERROR: {
          code: 'PAYMENT_UPLOAD_ERROR',
          message: 'Failed to upload payment slip',
          statusCode: 400,
        },
      },
    },
  };
});

describe('BankTransferService', () => {
  let bankTransferService: BankTransferService;
  let mockLogger: Partial<AppLoggerService>;
  let mockStorageService: Partial<IStorageService>;

  beforeEach(() => {
    mockLogger = {
      debug: vi.fn(),
      log: vi.fn(),
      error: vi.fn(),
    };

    mockStorageService = {
      uploadPaymentSlip: vi.fn(),
    };

    bankTransferService = new BankTransferService(
      mockLogger as AppLoggerService,
      mockStorageService as IStorageService,
    );
  });

  describe('uploadPaymentSlip', () => {
    it('should upload payment slip successfully', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'slip.jpg',
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      const uploadResult = {
        url: 'https://storage.example.com/slip.jpg',
        path: 'payment-slips/slip-order-123.jpg',
        filename: 'slip-order-123.jpg',
      };

      vi.spyOn(mockStorageService, 'uploadPaymentSlip').mockResolvedValue(
        uploadResult,
      );

      const result = await bankTransferService.uploadPaymentSlip(
        mockFile,
        'order-123',
      );

      expect(result).toEqual(uploadResult);
      expect(mockStorageService.uploadPaymentSlip).toHaveBeenCalledWith(
        mockFile,
        'order-123',
      );
      expect(mockLogger.log).toHaveBeenCalled();
    });

    it('should handle upload errors', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'slip.jpg',
      } as Express.Multer.File;

      const error = new Error('Upload failed');
      vi.spyOn(mockStorageService, 'uploadPaymentSlip').mockRejectedValue(
        error,
      );

      await expect(
        bankTransferService.uploadPaymentSlip(mockFile, 'order-123'),
      ).rejects.toThrow('Upload failed');

      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle non-Error error objects', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'slip.jpg',
      } as Express.Multer.File;

      vi.spyOn(mockStorageService, 'uploadPaymentSlip').mockRejectedValue(
        'String error',
      );

      await expect(
        bankTransferService.uploadPaymentSlip(mockFile, 'order-123'),
      ).rejects.toBe('String error');

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Unknown error'),
        undefined,
        'BankTransferService',
      );
    });
  });

  describe('validatePaymentSlip', () => {
    it('should return true for any slip URL', () => {
      const result = bankTransferService.validatePaymentSlip(
        'https://example.com/slip.jpg',
      );

      expect(result).toBe(true);
      expect(mockLogger.debug).toHaveBeenCalled();
    });

    it('should log validation attempt', () => {
      const slipUrl = 'https://storage.example.com/slip-123.jpg';
      bankTransferService.validatePaymentSlip(slipUrl);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining(slipUrl),
        'BankTransferService',
      );
    });
  });

  describe('TOKEN', () => {
    it('should have a unique TOKEN symbol', () => {
      expect(BankTransferService.TOKEN).toBeTypeOf('symbol');
      expect(BankTransferService.TOKEN.toString()).toBe(
        'Symbol(BankTransferService)',
      );
    });
  });
});
