import {
  Inject,
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Express } from 'express-serve-static-core';
import sharp from 'sharp';

import { ERROR_CODES } from '@/common/errors/error-code';
import { DEFAULT_LANGUAGE } from '@/enums/language.enum';
import { STORAGE_CONSTANTS } from '@/infrastructures/supabase/constants/storage.constants';
import { IStorageService } from '@/infrastructures/supabase/interfaces/storage.service.interface';
import { ISupabaseConnector } from '@/infrastructures/supabase/interfaces/supabase-connector.interface';
import { SupabaseConnector } from '@/infrastructures/supabase/services/supabase-connector';
import { AppLoggerService } from '@/modules/logger/services/app-logger.service';
import { NanoUtil } from '@/utils/nano.util';

export interface IUploadFileResult {
  url: string;
  path: string;
  filename: string;
}

@Injectable()
export class StorageService implements IStorageService {
  static readonly TOKEN = Symbol('StorageService');

  // File signature (magic bytes) for image validation
  private readonly JPEG_SIGNATURE = Buffer.from([0xff, 0xd8, 0xff]);
  private readonly PNG_SIGNATURE = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);

  constructor(
    @Inject(SupabaseConnector.TOKEN)
    private readonly supabaseConnector: ISupabaseConnector,
    private readonly logger: AppLoggerService,
  ) {}

  /**
   * Upload payment slip to Supabase Storage
   * @param file - Multer file object
   * @param enrollmentCourseId - Enrollment course ID for file path
   * @returns Upload result with URL and path
   * @throws BadRequestException if file validation fails
   * @throws InternalServerErrorException if upload fails
   */
  async uploadPaymentSlip(
    file: Express.Multer.File,
    enrollmentCourseId: string,
  ): Promise<IUploadFileResult> {
    this.logger.debug(
      `Uploading payment slip: ${file.originalname} for enrollmentCourseId: ${enrollmentCourseId}`,
      StorageService.name,
    );

    // Validate file (basic validation)
    this.validateFile(file);

    // Validate image file signature (magic bytes)
    this.validateFileSignature(file);

    // Validate image dimensions and metadata
    await this.validateImageDimensions(file);

    try {
      const supabase = this.supabaseConnector.getClient();

      // Generate unique filename using cryptographically secure random generator
      const fileExtension = this.getFileExtension(file.originalname);
      const timestamp = Date.now();
      const randomString = NanoUtil.generateId(13); // Generate 13-character secure random string
      const filename = `${enrollmentCourseId}_${timestamp}_${randomString}${fileExtension}`;
      const filePath = `${enrollmentCourseId}/${filename}`;

      // Upload file to Supabase Storage
      const { error } = await supabase.storage
        .from(STORAGE_CONSTANTS.BUCKET_NAME)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        this.logger.error(
          `Failed to upload file to Supabase Storage: ${error.message}`,
          error.stack,
          StorageService.name,
        );
        throw new InternalServerErrorException(
          `Failed to upload file: ${error.message}`,
        );
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage
        .from(STORAGE_CONSTANTS.BUCKET_NAME)
        .getPublicUrl(filePath);

      this.logger.log(
        `File uploaded successfully: ${filePath}`,
        StorageService.name,
      );

      return {
        url: publicUrl,
        path: filePath,
        filename: filename,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const stackTrace = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Unexpected error during file upload: ${errorMessage}`,
        stackTrace,
        StorageService.name,
      );

      throw new InternalServerErrorException(
        `Failed to upload file: ${errorMessage}`,
      );
    }
  }

  /**
   * Delete payment slip from Supabase Storage
   * @param path - File path in storage
   * @throws InternalServerErrorException if deletion fails
   */
  async deletePaymentSlip(path: string): Promise<void> {
    this.logger.debug(`Deleting file: ${path}`, StorageService.name);

    try {
      const supabase = this.supabaseConnector.getClient();

      const { error } = await supabase.storage
        .from(STORAGE_CONSTANTS.BUCKET_NAME)
        .remove([path]);

      if (error) {
        this.logger.error(
          `Failed to delete file from Supabase Storage: ${error.message}`,
          error.stack,
          StorageService.name,
        );
        throw new InternalServerErrorException(
          `Failed to delete file: ${error.message}`,
        );
      }

      this.logger.log(
        `File deleted successfully: ${path}`,
        StorageService.name,
      );
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const stackTrace = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Unexpected error during file deletion: ${errorMessage}`,
        stackTrace,
        StorageService.name,
      );

      throw new InternalServerErrorException(
        `Failed to delete file: ${errorMessage}`,
      );
    }
  }

  /**
   * Validate file before upload
   * @param file - Multer file object
   * @throws BadRequestException if validation fails
   */
  private validateFile(file: Express.Multer.File): void {
    if (file === null || file === undefined) {
      throw new BadRequestException('File is required');
    }

    // Check file size
    if (file.size > STORAGE_CONSTANTS.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${STORAGE_CONSTANTS.MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    // Check MIME type
    if (
      !STORAGE_CONSTANTS.ALLOWED_MIME_TYPES.includes(
        file.mimetype as 'image/jpeg' | 'image/png',
      )
    ) {
      throw new BadRequestException(
        `File type not allowed. Allowed types: ${STORAGE_CONSTANTS.ALLOWED_EXTENSIONS.join(', ')}`,
      );
    }

    // Check file extension
    const fileExtension = this.getFileExtension(file.originalname);
    if (
      !STORAGE_CONSTANTS.ALLOWED_EXTENSIONS.includes(
        fileExtension.toLowerCase() as '.jpg' | '.jpeg' | '.png',
      )
    ) {
      throw new BadRequestException(
        `File extension not allowed. Allowed extensions: ${STORAGE_CONSTANTS.ALLOWED_EXTENSIONS.join(', ')}`,
      );
    }
  }

  /**
   * Get file extension from filename
   * @param filename - Original filename
   * @returns File extension with dot (e.g., '.jpg')
   */
  private getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return '';
    }
    return filename.substring(lastDotIndex);
  }

  /**
   * Validate file signature (magic bytes) to ensure file type matches extension
   * This prevents file type spoofing attacks
   * @param file - Multer file object
   * @throws BadRequestException if file signature doesn't match declared type
   */
  private validateFileSignature(file: Express.Multer.File): void {
    this.logger.debug(
      `Validating file signature for: ${file.originalname}`,
      StorageService.name,
    );

    if (file.buffer.length === 0) {
      throw new BadRequestException('File buffer is empty');
    }

    const buffer = file.buffer;

    // Check JPEG signature (starts with FF D8 FF)
    if (
      file.mimetype === 'image/jpeg' ||
      file.originalname.toLowerCase().endsWith('.jpg') ||
      file.originalname.toLowerCase().endsWith('.jpeg')
    ) {
      const jpegSignature = buffer.subarray(0, 3);
      if (!jpegSignature.equals(this.JPEG_SIGNATURE)) {
        this.logger.warn(
          `JPEG file signature mismatch for: ${file.originalname}`,
          StorageService.name,
        );
        throw new BadRequestException(
          ERROR_CODES.PAYMENT.INVALID_IMAGE_FORMAT.getMessage(DEFAULT_LANGUAGE),
        );
      }
      return;
    }

    // Check PNG signature (starts with 89 50 4E 47 0D 0A 1A 0A)
    if (
      file.mimetype === 'image/png' ||
      file.originalname.toLowerCase().endsWith('.png')
    ) {
      const pngSignature = buffer.subarray(0, 8);
      if (!pngSignature.equals(this.PNG_SIGNATURE)) {
        this.logger.warn(
          `PNG file signature mismatch for: ${file.originalname}`,
          StorageService.name,
        );
        throw new BadRequestException(
          ERROR_CODES.PAYMENT.INVALID_IMAGE_FORMAT.getMessage(DEFAULT_LANGUAGE),
        );
      }
      return;
    }

    // If we get here, file type is not supported
    this.logger.warn(
      `Unsupported file type for signature validation: ${file.mimetype}`,
      StorageService.name,
    );
    throw new BadRequestException(
      ERROR_CODES.PAYMENT.INVALID_IMAGE_FORMAT.getMessage(DEFAULT_LANGUAGE),
    );
  }

  /**
   * Validate image dimensions and metadata using Sharp
   * @param file - Multer file object
   * @throws BadRequestException if image dimensions are invalid or processing fails
   */
  private async validateImageDimensions(
    file: Express.Multer.File,
  ): Promise<void> {
    this.logger.debug(
      `Validating image dimensions for: ${file.originalname}`,
      StorageService.name,
    );

    try {
      // Use Sharp to read image metadata without processing the image
      const metadata = await sharp(file.buffer).metadata();

      if (!metadata.width || !metadata.height) {
        this.logger.warn(
          `Unable to read image dimensions for: ${file.originalname}`,
          StorageService.name,
        );
        throw new BadRequestException(
          ERROR_CODES.PAYMENT.IMAGE_PROCESSING_ERROR.getMessage(
            DEFAULT_LANGUAGE,
          ),
        );
      }

      const { width, height } = metadata;

      // Log image metadata for debugging
      this.logger.debug(
        `Image metadata - Width: ${width}, Height: ${height}, Format: ${metadata.format}, Size: ${file.size} bytes`,
        StorageService.name,
      );

      // Validate minimum dimensions
      if (
        width < STORAGE_CONSTANTS.MIN_IMAGE_WIDTH ||
        height < STORAGE_CONSTANTS.MIN_IMAGE_HEIGHT
      ) {
        this.logger.warn(
          `Image dimensions too small: ${width}x${height} for: ${file.originalname}`,
          StorageService.name,
        );
        throw new BadRequestException(
          ERROR_CODES.PAYMENT.IMAGE_DIMENSIONS_TOO_SMALL.getMessage(
            DEFAULT_LANGUAGE,
          ),
        );
      }

      // Validate maximum dimensions (prevent DoS attacks with extremely large images)
      if (
        width > STORAGE_CONSTANTS.MAX_IMAGE_WIDTH ||
        height > STORAGE_CONSTANTS.MAX_IMAGE_HEIGHT
      ) {
        this.logger.warn(
          `Image dimensions too large: ${width}x${height} for: ${file.originalname}`,
          StorageService.name,
        );
        throw new BadRequestException(
          ERROR_CODES.PAYMENT.IMAGE_DIMENSIONS_TOO_LARGE.getMessage(
            DEFAULT_LANGUAGE,
          ),
        );
      }

      // Validate format matches expected type
      if (
        metadata.format &&
        file.mimetype === 'image/jpeg' &&
        metadata.format !== 'jpeg'
      ) {
        this.logger.warn(
          `Image format mismatch: declared JPEG but actual format is ${metadata.format}`,
          StorageService.name,
        );
        throw new BadRequestException(
          ERROR_CODES.PAYMENT.INVALID_IMAGE_FORMAT.getMessage(DEFAULT_LANGUAGE),
        );
      }

      if (
        metadata.format &&
        file.mimetype === 'image/png' &&
        metadata.format !== 'png'
      ) {
        this.logger.warn(
          `Image format mismatch: declared PNG but actual format is ${metadata.format}`,
          StorageService.name,
        );
        throw new BadRequestException(
          ERROR_CODES.PAYMENT.INVALID_IMAGE_FORMAT.getMessage(DEFAULT_LANGUAGE),
        );
      }

      this.logger.debug(
        `Image dimensions validation passed: ${width}x${height}`,
        StorageService.name,
      );
    } catch (error) {
      // Re-throw BadRequestException (our validation errors)
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Handle Sharp processing errors
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to process image: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        StorageService.name,
      );
      throw new BadRequestException(
        ERROR_CODES.PAYMENT.IMAGE_PROCESSING_ERROR.getMessage(DEFAULT_LANGUAGE),
      );
    }
  }
}
