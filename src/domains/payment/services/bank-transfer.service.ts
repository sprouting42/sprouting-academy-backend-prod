import { Inject, Injectable } from '@nestjs/common';
import type { Express } from 'express-serve-static-core';

import { IStorageService } from '@/infrastructures/supabase/interfaces/storage.service.interface';
import { StorageService } from '@/infrastructures/supabase/services/storage.service';
import { AppLoggerService } from '@/modules/logger/services/app-logger.service';

/**
 * Bank Transfer Service
 *
 * Lightweight service for handling bank transfer specific operations
 * - Upload payment slip to storage
 * - Validate slip (future: OCR, AI validation)
 */
@Injectable()
export class BankTransferService {
  static readonly TOKEN = Symbol('BankTransferService');

  constructor(
    private readonly logger: AppLoggerService,
    @Inject(StorageService.TOKEN)
    private readonly storageService: IStorageService,
  ) {}

  /**
   * Upload payment slip to Supabase Storage
   */
  async uploadPaymentSlip(
    file: Express.Multer.File,
    orderId: string,
  ): Promise<{ url: string; filename: string }> {
    this.logger.debug(
      `Uploading payment slip for order: ${orderId}`,
      BankTransferService.name,
    );

    try {
      const result = await this.storageService.uploadPaymentSlip(file, orderId);

      this.logger.log(
        `Payment slip uploaded successfully: ${result.filename}`,
        BankTransferService.name,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to upload payment slip: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        BankTransferService.name,
      );
      throw error;
    }
  }

  /**
   * Validate payment slip
   */
  validatePaymentSlip(slipUrl: string): boolean {
    this.logger.debug(
      `Validating payment slip: ${slipUrl}`,
      BankTransferService.name,
    );

    // For now, just return true
    // In the future, this can integrate with:
    // - OCR service to read slip data
    // - AI to detect fake slips
    // - Bank API to verify transaction

    return true;
  }
}
