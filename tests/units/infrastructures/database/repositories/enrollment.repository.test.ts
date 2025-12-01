/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { describe, it, expect, beforeEach, vi } from 'vitest';

import type { PrismaDatabase } from '@/infrastructures/database/prisma/prisma-database';
import { EnrollmentRepository } from '@/infrastructures/database/repositories/enrollment.repository';

describe('EnrollmentRepository (Infrastructure)', () => {
  let repository: EnrollmentRepository;
  let mockDb: PrismaDatabase;

  const mockEnrollmentEntity = {
    id: 'enrollment_123',
    userId: 'user_123',
    courseId: 'course_123',
    paymentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(() => {
    mockDb = {
      enrollment: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      course: {
        findUnique: vi.fn(),
      },
    } as any;

    repository = new EnrollmentRepository(mockDb);
  });

  describe('findCourseById', () => {
    it('should return course details when found', async () => {
      (mockDb.course.findUnique as any).mockResolvedValue({
        id: 'course_123',
        coursesTitle: 'Test Course',
        normalPrice: 1000,
      });

      const result = await repository.findCourseById('course_123');

      expect(result).toBeDefined();
      expect(result?.id).toBe('course_123');
      expect(result?.title).toBe('Test Course');
      expect(result?.price).toBe(1000);
    });

    it('should return null when course not found', async () => {
      (mockDb.course.findUnique as any).mockResolvedValue(null);

      const result = await repository.findCourseById('course_123');

      expect(result).toBeNull();
    });
  });

  describe('findByUserIdAndCourseId', () => {
    it('should return enrollment dto when found', async () => {
      (mockDb.enrollment.findFirst as any).mockResolvedValue(
        mockEnrollmentEntity,
      );

      const result = await repository.findByUserIdAndCourseId(
        'user_123',
        'course_123',
      );

      expect(result).toBeDefined();
      expect(result?.id).toBe('enrollment_123');
      expect(mockDb.enrollment.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'user_123',
          courseId: 'course_123',
          deletedAt: null,
        },
      });
    });

    it('should return null when not found', async () => {
      (mockDb.enrollment.findFirst as any).mockResolvedValue(null);

      const result = await repository.findByUserIdAndCourseId(
        'user_123',
        'course_123',
      );

      expect(result).toBeNull();
    });
  });
});
