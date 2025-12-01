import { describe, it, expect, beforeEach, vi } from 'vitest';

// Unmock ERROR_CODES to ensure we use the real implementation
// This prevents other tests (e.g., payment.service.test.ts) from mocking it incorrectly
vi.unmock('@/common/errors/error-code');

// Unmock EnrollmentService to ensure we test the real implementation
// This prevents other tests (e.g., order.module.test.ts) from mocking it
vi.unmock('@/domains/enrollment/services/enrollment.service');

import { ERROR_CODES } from '@/common/errors/error-code';
import type { IEnrollmentRepository } from '@/domains/enrollment/repositories/interfaces/enrollment.repository.interface';
import type { CreateEnrollmentInput } from '@/domains/enrollment/services/dto/create-enrollment.input';
import { EnrollmentService } from '@/domains/enrollment/services/enrollment.service';
import type { EnrollmentDto } from '@/infrastructures/database/dto/enrollment.dto';
import type { AppLoggerService } from '@/modules/logger/services/app-logger.service';

describe('EnrollmentService', () => {
  let enrollmentService: EnrollmentService;
  let mockEnrollmentRepository: Partial<IEnrollmentRepository>;
  let mockLogger: Partial<AppLoggerService>;

  const mockEnrollment: EnrollmentDto = {
    id: 'enrollment-123',
    userId: 'user-123',
    courseId: 'course-123',
    paymentId: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockCourse = {
    id: 'course-123',
    title: 'Test Course',
    price: 1000,
  };

  beforeEach(() => {
    mockLogger = {
      debug: vi.fn(),
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    mockEnrollmentRepository = {
      findCourseById: vi.fn(),
      findByUserIdAndCourseId: vi.fn(),
      createEnrollment: vi.fn(),
      findOneById: vi.fn(),
      findByUserId: vi.fn(),
    };

    enrollmentService = new EnrollmentService(
      mockEnrollmentRepository as IEnrollmentRepository,
      mockLogger as AppLoggerService,
    );
  });

  describe('createEnrollment', () => {
    it('should create enrollment successfully', async () => {
      const input: CreateEnrollmentInput = {
        userId: 'user-123',
        courseId: 'course-123',
      };

      vi.spyOn(mockEnrollmentRepository, 'findCourseById').mockResolvedValue(
        mockCourse,
      );
      vi.spyOn(
        mockEnrollmentRepository,
        'findByUserIdAndCourseId',
      ).mockResolvedValue(null);
      vi.spyOn(mockEnrollmentRepository, 'createEnrollment').mockResolvedValue(
        mockEnrollment,
      );

      const result = await enrollmentService.createEnrollment(input);

      expect(result.isSuccessful).toBe(true);
      expect(result.responseContent?.id).toBe('enrollment-123');
      expect(result.responseContent?.course).toBe('Test Course');
      expect(result.responseContent?.coursePrice).toBe(1000);
    });

    it('should fail when course not found', async () => {
      const input: CreateEnrollmentInput = {
        userId: 'user-123',
        courseId: 'non-existent',
      };

      vi.spyOn(mockEnrollmentRepository, 'findCourseById').mockResolvedValue(
        null,
      );

      const result = await enrollmentService.createEnrollment(input);

      expect(result.isSuccessful).toBe(false);
      expect(result.errorDetails?.code).toBe(
        ERROR_CODES.ENROLLMENT.COURSE_NOT_FOUND.code,
      );
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should fail when user already enrolled', async () => {
      const input: CreateEnrollmentInput = {
        userId: 'user-123',
        courseId: 'course-123',
      };

      vi.spyOn(mockEnrollmentRepository, 'findCourseById').mockResolvedValue(
        mockCourse,
      );
      vi.spyOn(
        mockEnrollmentRepository,
        'findByUserIdAndCourseId',
      ).mockResolvedValue(mockEnrollment);

      const result = await enrollmentService.createEnrollment(input);

      expect(result.isSuccessful).toBe(false);
      expect(result.errorDetails?.code).toBe(
        ERROR_CODES.ENROLLMENT.ALREADY_ENROLLED.code,
      );
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const input: CreateEnrollmentInput = {
        userId: 'user-123',
        courseId: 'course-123',
      };

      vi.spyOn(mockEnrollmentRepository, 'findCourseById').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await enrollmentService.createEnrollment(input);

      expect(result.isSuccessful).toBe(false);
      expect(result.errorDetails?.code).toBe(
        ERROR_CODES.ENROLLMENT.INTERNAL_SERVER_ERROR.code,
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getEnrollmentById', () => {
    it('should get enrollment by id successfully', async () => {
      vi.spyOn(mockEnrollmentRepository, 'findOneById').mockResolvedValue(
        mockEnrollment,
      );
      vi.spyOn(mockEnrollmentRepository, 'findCourseById').mockResolvedValue(
        mockCourse,
      );

      const result =
        await enrollmentService.getEnrollmentById('enrollment-123');

      expect(result.isSuccessful).toBe(true);
      expect(result.responseContent?.id).toBe('enrollment-123');
      expect(result.responseContent?.course).toBe('Test Course');
    });

    it('should return Unknown Course when course not found', async () => {
      vi.spyOn(mockEnrollmentRepository, 'findOneById').mockResolvedValue(
        mockEnrollment,
      );
      vi.spyOn(mockEnrollmentRepository, 'findCourseById').mockResolvedValue(
        null,
      );

      const result =
        await enrollmentService.getEnrollmentById('enrollment-123');

      expect(result.isSuccessful).toBe(true);
      expect(result.responseContent?.course).toBe('Unknown Course');
    });

    it('should fail when enrollment not found', async () => {
      vi.spyOn(mockEnrollmentRepository, 'findOneById').mockResolvedValue(null);

      const result = await enrollmentService.getEnrollmentById('non-existent');

      expect(result.isSuccessful).toBe(false);
      expect(result.errorDetails?.code).toBe(
        ERROR_CODES.ENROLLMENT.ENROLLMENT_NOT_FOUND.code,
      );
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      vi.spyOn(mockEnrollmentRepository, 'findOneById').mockRejectedValue(
        new Error('Database error'),
      );

      const result =
        await enrollmentService.getEnrollmentById('enrollment-123');

      expect(result.isSuccessful).toBe(false);
      expect(result.errorDetails?.code).toBe(
        ERROR_CODES.ENROLLMENT.INTERNAL_SERVER_ERROR.code,
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getMyEnrollments', () => {
    it('should get user enrollments successfully', async () => {
      const enrollments = [mockEnrollment];
      vi.spyOn(mockEnrollmentRepository, 'findByUserId').mockResolvedValue(
        enrollments,
      );
      vi.spyOn(mockEnrollmentRepository, 'findCourseById').mockResolvedValue(
        mockCourse,
      );

      const result = await enrollmentService.getMyEnrollments('user-123');

      expect(result.isSuccessful).toBe(true);
      expect(result.responseContent).toHaveLength(1);
      expect(result.responseContent?.[0]?.course).toBe('Test Course');
    });

    it('should return empty array when user has no enrollments', async () => {
      vi.spyOn(mockEnrollmentRepository, 'findByUserId').mockResolvedValue([]);

      const result = await enrollmentService.getMyEnrollments('user-456');

      expect(result.isSuccessful).toBe(true);
      expect(result.responseContent).toHaveLength(0);
    });

    it('should handle Unknown Course for missing courses', async () => {
      const enrollments = [mockEnrollment];
      vi.spyOn(mockEnrollmentRepository, 'findByUserId').mockResolvedValue(
        enrollments,
      );
      vi.spyOn(mockEnrollmentRepository, 'findCourseById').mockResolvedValue(
        null,
      );

      const result = await enrollmentService.getMyEnrollments('user-123');

      expect(result.isSuccessful).toBe(true);
      expect(result.responseContent?.[0]?.course).toBe('Unknown Course');
    });

    it('should handle errors gracefully', async () => {
      vi.spyOn(mockEnrollmentRepository, 'findByUserId').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await enrollmentService.getMyEnrollments('user-123');

      expect(result.isSuccessful).toBe(false);
      expect(result.errorDetails?.code).toBe(
        ERROR_CODES.ENROLLMENT.INTERNAL_SERVER_ERROR.code,
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('TOKEN', () => {
    it('should have a unique TOKEN symbol', () => {
      expect(EnrollmentService.TOKEN).toBeTypeOf('symbol');
      expect(EnrollmentService.TOKEN.toString()).toBe(
        'Symbol(EnrollmentService)',
      );
    });
  });
});
