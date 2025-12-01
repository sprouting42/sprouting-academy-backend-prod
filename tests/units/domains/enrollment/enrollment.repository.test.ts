/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { EnrollmentRepository } from '@/domains/enrollment/repositories/enrollment.repository';
import type { CreateEnrollmentInput } from '@/domains/enrollment/repositories/interfaces/enrollment.repository.interface';
import type { EnrollmentDto } from '@/infrastructures/database/dto/enrollment.dto';
import type { PrismaDatabase } from '@/infrastructures/database/prisma/prisma-database';
import type { EnrollmentRepository as InfraEnrollmentRepository } from '@/infrastructures/database/repositories/enrollment.repository';

describe('EnrollmentRepository', () => {
  let enrollmentRepository: EnrollmentRepository;
  let mockInfraEnrollmentRepository: Partial<InfraEnrollmentRepository>;
  let mockDb: Partial<PrismaDatabase>;

  const mockEnrollment: EnrollmentDto = {
    id: 'enrollment-123',
    userId: 'user-123',
    courseId: 'course-123',
    paymentId: 'payment-123',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  beforeEach(() => {
    mockInfraEnrollmentRepository = {
      findOneById: vi.fn(),
      findMany: vi.fn(),
      findCourseById: vi.fn(),
      findByUserIdAndCourseId: vi.fn(),
    };

    mockDb = {
      enrollment: {
        create: vi.fn(),
        update: vi.fn(),
      } as never,
    };

    enrollmentRepository = new EnrollmentRepository(
      mockInfraEnrollmentRepository as InfraEnrollmentRepository,
      mockDb as PrismaDatabase,
    );
  });

  describe('findOneById', () => {
    it('should find enrollment by id successfully', async () => {
      vi.spyOn(mockInfraEnrollmentRepository, 'findOneById').mockResolvedValue(
        mockEnrollment,
      );

      const result = await enrollmentRepository.findOneById('enrollment-123');

      expect(result).toEqual(mockEnrollment);
      expect(mockInfraEnrollmentRepository.findOneById).toHaveBeenCalledWith(
        'enrollment-123',
      );
    });

    it('should return null when enrollment not found', async () => {
      vi.spyOn(mockInfraEnrollmentRepository, 'findOneById').mockResolvedValue(
        null,
      );

      const result = await enrollmentRepository.findOneById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find enrollments by user id', async () => {
      const enrollments = [mockEnrollment];
      vi.spyOn(mockInfraEnrollmentRepository, 'findMany').mockResolvedValue(
        enrollments,
      );

      const result = await enrollmentRepository.findByUserId('user-123');

      expect(result).toEqual(enrollments);
      expect(mockInfraEnrollmentRepository.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when user has no enrollments', async () => {
      vi.spyOn(mockInfraEnrollmentRepository, 'findMany').mockResolvedValue([]);

      const result = await enrollmentRepository.findByUserId('user-456');

      expect(result).toEqual([]);
    });
  });

  describe('createEnrollment', () => {
    it('should create enrollment successfully with payment id', async () => {
      const input: CreateEnrollmentInput = {
        userId: 'user-123',
        courseId: 'course-123',
        paymentId: 'payment-123',
      };

      vi.spyOn(mockDb.enrollment!, 'create').mockResolvedValue({
        id: 'enrollment-123',
        userId: 'user-123',
        courseId: 'course-123',
        paymentId: 'payment-123',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      } as never);

      const result = await enrollmentRepository.createEnrollment(input);

      expect(result.id).toBe('enrollment-123');
      expect(result.userId).toBe('user-123');
      expect(result.courseId).toBe('course-123');
      expect(result.paymentId).toBe('payment-123');
    });

    it('should create enrollment with null payment id', async () => {
      const input: CreateEnrollmentInput = {
        userId: 'user-123',
        courseId: 'course-123',
        paymentId: null,
      };

      vi.spyOn(mockDb.enrollment!, 'create').mockResolvedValue({
        ...mockEnrollment,
        paymentId: null,
      } as never);

      const result = await enrollmentRepository.createEnrollment(input);

      expect(result.paymentId).toBeNull();
    });

    it('should create enrollment without payment id', async () => {
      const input: CreateEnrollmentInput = {
        userId: 'user-123',
        courseId: 'course-123',
      };

      vi.spyOn(mockDb.enrollment!, 'create').mockResolvedValue({
        ...mockEnrollment,
        paymentId: null,
      } as never);

      const result = await enrollmentRepository.createEnrollment(input);

      expect(result.paymentId).toBeNull();
    });
  });

  describe('updatePaymentId', () => {
    it('should update payment id successfully', async () => {
      vi.spyOn(mockDb.enrollment!, 'update').mockResolvedValue({
        ...mockEnrollment,
        paymentId: 'payment-456',
      } as never);

      const result = await enrollmentRepository.updatePaymentId(
        'enrollment-123',
        'payment-456',
      );

      expect(result.paymentId).toBe('payment-456');
      expect(mockDb.enrollment!.update).toHaveBeenCalledWith({
        where: { id: 'enrollment-123' },
        data: { paymentId: 'payment-456' },
      });
    });
  });

  describe('findCourseById', () => {
    it('should find course by id', async () => {
      const course = { id: 'course-123', title: 'Test Course', price: 1000 };
      vi.spyOn(
        mockInfraEnrollmentRepository,
        'findCourseById',
      ).mockResolvedValue(course);

      const result = await enrollmentRepository.findCourseById('course-123');

      expect(result).toEqual(course);
      expect(mockInfraEnrollmentRepository.findCourseById).toHaveBeenCalledWith(
        'course-123',
      );
    });

    it('should return null when course not found', async () => {
      vi.spyOn(
        mockInfraEnrollmentRepository,
        'findCourseById',
      ).mockResolvedValue(null);

      const result = await enrollmentRepository.findCourseById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByUserIdAndCourseId', () => {
    it('should find enrollment by user id and course id', async () => {
      vi.spyOn(
        mockInfraEnrollmentRepository,
        'findByUserIdAndCourseId',
      ).mockResolvedValue(mockEnrollment);

      const result = await enrollmentRepository.findByUserIdAndCourseId(
        'user-123',
        'course-123',
      );

      expect(result).toEqual(mockEnrollment);
      expect(
        mockInfraEnrollmentRepository.findByUserIdAndCourseId,
      ).toHaveBeenCalledWith('user-123', 'course-123');
    });

    it('should return null when enrollment not found', async () => {
      vi.spyOn(
        mockInfraEnrollmentRepository,
        'findByUserIdAndCourseId',
      ).mockResolvedValue(null);

      const result = await enrollmentRepository.findByUserIdAndCourseId(
        'user-456',
        'course-456',
      );

      expect(result).toBeNull();
    });
  });

  describe('TOKEN', () => {
    it('should have a unique TOKEN symbol', () => {
      expect(EnrollmentRepository.TOKEN).toBeTypeOf('symbol');
      expect(EnrollmentRepository.TOKEN.toString()).toBe(
        'Symbol(EnrollmentRepository)',
      );
    });
  });
});
