/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Express } from 'express-serve-static-core';
import sharp from 'sharp';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import type { ISupabaseConnector } from '@/infrastructures/supabase/interfaces/supabase-connector.interface';
import { StorageService } from '@/infrastructures/supabase/services/storage.service';
import type { AppLoggerService } from '@/modules/logger/services/app-logger.service';

// Mock sharp
vi.mock('sharp', () => {
  const mockMetadata = vi.fn();
  return {
    default: vi.fn(() => ({
      metadata: mockMetadata,
    })),
  };
});

describe('StorageService', () => {
  let service: StorageService;
  let mockSupabaseConnector: Partial<ISupabaseConnector>;
  let mockLogger: Partial<AppLoggerService>;
  let mockSupabaseClient: {
    storage: {
      from: ReturnType<typeof vi.fn>;
    };
  };

  const mockFile = {
    originalname: 'test.jpg',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0]), // Valid JPEG header
  } as Express.Multer.File;

  beforeEach(() => {
    mockLogger = {
      debug: vi.fn(),
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    mockSupabaseClient = {
      storage: {
        from: vi.fn(() => ({
          upload: vi.fn().mockResolvedValue({ error: null }),
          getPublicUrl: vi.fn().mockReturnValue({
            data: { publicUrl: 'https://example.com/test.jpg' },
          }),
          remove: vi.fn().mockResolvedValue({ error: null }),
        })),
      },
    };

    mockSupabaseConnector = {
      getClient: vi.fn().mockReturnValue(mockSupabaseClient),
    };

    service = new StorageService(
      mockSupabaseConnector as ISupabaseConnector,
      mockLogger as AppLoggerService,
    );

    // Reset sharp mock
    (sharp as any).mockImplementation(() => ({
      metadata: vi.fn().mockResolvedValue({
        width: 800,
        height: 600,
        format: 'jpeg',
      }),
    }));
  });

  describe('uploadPaymentSlip', () => {
    it('should upload file successfully', async () => {
      const result = await service.uploadPaymentSlip(mockFile, 'course-123');

      expect(result.url).toBe('https://example.com/test.jpg');
      expect(result.filename).toContain('course-123');
      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith(
        'payment-slips',
      );
    });

    it('should fail if file is missing', async () => {
      await expect(
        service.uploadPaymentSlip(
          null as unknown as Express.Multer.File,
          'course-123',
        ),
      ).rejects.toThrow();
    });

    it('should fail if file size is too large', async () => {
      const largeFile = { ...mockFile, size: 10 * 1024 * 1024 }; // 10MB
      await expect(
        service.uploadPaymentSlip(largeFile, 'course-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should fail if mime type is invalid', async () => {
      const invalidFile = { ...mockFile, mimetype: 'application/pdf' };
      await expect(
        service.uploadPaymentSlip(invalidFile, 'course-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should fail if extension is invalid', async () => {
      const invalidFile = { ...mockFile, originalname: 'test.pdf' };
      await expect(
        service.uploadPaymentSlip(invalidFile, 'course-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should fail if signature is invalid (JPEG)', async () => {
      const invalidSignatureFile = {
        ...mockFile,
        buffer: Buffer.from([0x00, 0x00, 0x00]),
      };
      await expect(
        service.uploadPaymentSlip(invalidSignatureFile, 'course-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should fail if image dimensions are too small', async () => {
      (sharp as any).mockImplementation(() => ({
        metadata: vi.fn().mockResolvedValue({
          width: 100,
          height: 100,
          format: 'jpeg',
        }),
      }));

      await expect(
        service.uploadPaymentSlip(mockFile, 'course-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should fail if image dimensions are too large', async () => {
      (sharp as any).mockImplementation(() => ({
        metadata: vi.fn().mockResolvedValue({
          width: 20000,
          height: 20000,
          format: 'jpeg',
        }),
      }));

      await expect(
        service.uploadPaymentSlip(mockFile, 'course-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should fail if format mismatch', async () => {
      (sharp as any).mockImplementation(() => ({
        metadata: vi.fn().mockResolvedValue({
          width: 800,
          height: 600,
          format: 'png', // Mismatch with mimetype image/jpeg
        }),
      }));

      await expect(
        service.uploadPaymentSlip(mockFile, 'course-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle upload error from supabase', async () => {
      mockSupabaseClient.storage.from.mockReturnValue({
        upload: vi
          .fn()
          .mockResolvedValue({ error: { message: 'Upload failed' } }),
      });

      await expect(
        service.uploadPaymentSlip(mockFile, 'course-123'),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle unexpected errors', async () => {
      mockSupabaseClient.storage.from.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await expect(
        service.uploadPaymentSlip(mockFile, 'course-123'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('deletePaymentSlip', () => {
    it('should delete file successfully', async () => {
      await service.deletePaymentSlip('path/to/file.jpg');

      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith(
        'payment-slips',
      );
    });

    it('should handle delete error from supabase', async () => {
      mockSupabaseClient.storage.from.mockReturnValue({
        remove: vi
          .fn()
          .mockResolvedValue({ error: { message: 'Delete failed' } }),
      });

      await expect(
        service.deletePaymentSlip('path/to/file.jpg'),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle unexpected errors', async () => {
      mockSupabaseClient.storage.from.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await expect(
        service.deletePaymentSlip('path/to/file.jpg'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('TOKEN', () => {
    it('should have a unique TOKEN symbol', () => {
      expect(StorageService.TOKEN).toBeTypeOf('symbol');
      expect(StorageService.TOKEN.toString()).toBe('Symbol(StorageService)');
    });
  });
});
