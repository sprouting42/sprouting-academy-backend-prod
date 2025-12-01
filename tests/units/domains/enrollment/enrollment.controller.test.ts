import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ResponseOutputWithContent } from '@/common/response/response-output';
import { EnrollmentController } from '@/domains/enrollment/controller/enrollment.controller';
import type { IEnrollmentService } from '@/domains/enrollment/services/interfaces/enrollment.service.interface';
import { Language } from '@/enums/language.enum';

describe('EnrollmentController', () => {
  let controller: EnrollmentController;
  let mockEnrollmentService: Partial<IEnrollmentService>;

  const mockUser = { userId: 'user-123' };

  beforeEach(() => {
    mockEnrollmentService = {
      createEnrollment: vi.fn(),
      getEnrollmentById: vi.fn(),
      getMyEnrollments: vi.fn(),
    };

    controller = new EnrollmentController(
      mockEnrollmentService as IEnrollmentService,
    );
  });

  describe('createEnrollment', () => {
    it('should create enrollment successfully', async () => {
      const body = { courseId: 'course-123' };

      const mockResult = ResponseOutputWithContent.successWithContent(
        { userId: 'user-123', courseId: 'course-123' },
        {
          id: 'enrollment-123',
          userId: 'user-123',
          courseId: 'course-123',
          course: 'Test Course',
          coursePrice: 1000,
        },
      );

      vi.spyOn(mockEnrollmentService, 'createEnrollment').mockResolvedValue(
        mockResult as never,
      );

      const result = await controller.createEnrollment(
        mockUser,
        Language.EN,
        body,
      );

      expect(result.isSuccessful).toBe(true);
      expect(mockEnrollmentService.createEnrollment).toHaveBeenCalledWith({
        userId: 'user-123',
        courseId: 'course-123',
      });
    });

    it('should handle errors', async () => {
      const body = { courseId: 'course-123' };

      vi.spyOn(mockEnrollmentService, 'createEnrollment').mockRejectedValue(
        new Error('Course not found'),
      );

      const result = await controller.createEnrollment(
        mockUser,
        Language.EN,
        body,
      );

      expect(result.isSuccessful).toBe(false);
    });
  });

  describe('getEnrollmentById', () => {
    it('should get enrollment by id successfully', async () => {
      const mockResult = ResponseOutputWithContent.successWithContent(
        { id: 'enrollment-123' },
        {
          id: 'enrollment-123',
          userId: 'user-123',
          courseId: 'course-123',
          course: 'Test Course',
        },
      );

      vi.spyOn(mockEnrollmentService, 'getEnrollmentById').mockResolvedValue(
        mockResult as never,
      );

      const result = await controller.getEnrollmentById(
        'enrollment-123',
        Language.EN,
      );

      expect(result.isSuccessful).toBe(true);
      expect(mockEnrollmentService.getEnrollmentById).toHaveBeenCalledWith(
        'enrollment-123',
      );
    });

    it('should handle errors', async () => {
      vi.spyOn(mockEnrollmentService, 'getEnrollmentById').mockRejectedValue(
        new Error('Enrollment not found'),
      );

      const result = await controller.getEnrollmentById(
        'enrollment-123',
        Language.EN,
      );

      expect(result.isSuccessful).toBe(false);
    });
  });

  describe('getMyEnrollments', () => {
    it('should get user enrollments successfully', async () => {
      const mockResult = ResponseOutputWithContent.successWithContent(
        { userId: 'user-123' },
        [
          {
            id: 'enrollment-1',
            userId: 'user-123',
            courseId: 'course-1',
            course: 'Course 1',
          },
          {
            id: 'enrollment-2',
            userId: 'user-123',
            courseId: 'course-2',
            course: 'Course 2',
          },
        ],
      );

      vi.spyOn(mockEnrollmentService, 'getMyEnrollments').mockResolvedValue(
        mockResult as never,
      );

      const result = await controller.getMyEnrollments(mockUser, Language.EN);

      expect(result.isSuccessful).toBe(true);
      expect(mockEnrollmentService.getMyEnrollments).toHaveBeenCalledWith(
        'user-123',
      );
    });

    it('should return empty array when user has no enrollments', async () => {
      const mockResult = ResponseOutputWithContent.successWithContent(
        { userId: 'user-123' },
        [],
      );

      vi.spyOn(mockEnrollmentService, 'getMyEnrollments').mockResolvedValue(
        mockResult as never,
      );

      const result = await controller.getMyEnrollments(mockUser, Language.EN);

      expect(result.isSuccessful).toBe(true);
    });

    it('should handle errors', async () => {
      vi.spyOn(mockEnrollmentService, 'getMyEnrollments').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await controller.getMyEnrollments(mockUser, Language.EN);

      expect(result.isSuccessful).toBe(false);
    });
  });
});
