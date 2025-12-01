/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { EnrollmentRepository } from '@/domains/enrollment/repositories/enrollment.repository';
import type { EnrollmentDto } from '@/infrastructures/database/dto/enrollment.dto';
import type { PrismaDatabase } from '@/infrastructures/database/prisma/prisma-database';

// Mock BaseRepository to prevent "Class extends value undefined" error
vi.mock('@/infrastructures/database/abstracts/base.repository', () => ({
  BaseRepository: class {
    constructor(
      protected prismaModel: any,
      protected dtoClass: any,
    ) {}
  },
}));

// Remove module mock
// vi.mock('@/infrastructures/database/repositories/enrollment.repository', ...);

describe('EnrollmentRepository', () => {
  let enrollmentRepository: EnrollmentRepository;
  let mockInfraRepository: any;
  let mockDb: PrismaDatabase;

  const mockEnrollment: EnrollmentDto = {
    id: 'enrollment-123',
    userId: 'user-123',
    courseId: 'course-123',
    paymentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockDb = {
      enrollment: {
        create: vi.fn(),
        update: vi.fn(),
      },
    } as any;

    mockInfraRepository = {
      findOneById: vi.fn(),
      findMany: vi.fn(),
      findCourseById: vi.fn(),
      findByUserIdAndCourseId: vi.fn(),
    };

    enrollmentRepository = new EnrollmentRepository(
      mockInfraRepository,
      mockDb,
    );
  });

  describe('createEnrollment', () => {
    it('should create enrollment using prisma', async () => {
      const input = {
        userId: 'user-123',
        courseId: 'course-123',
        paymentId: null,
      };

      (mockDb.enrollment.create as any).mockResolvedValue(mockEnrollment);

      const result = await enrollmentRepository.createEnrollment(input);

      expect(result.id).toBe('enrollment-123');
      expect(mockDb.enrollment.create).toHaveBeenCalledWith({
        data: {
          userId: input.userId,
          courseId: input.courseId,
          paymentId: null,
        },
      });
    });
  });

  describe('updatePaymentId', () => {
    it('should update payment id using prisma', async () => {
      (mockDb.enrollment.update as any).mockResolvedValue({
        ...mockEnrollment,
        paymentId: 'pay-123',
      });

      const result = await enrollmentRepository.updatePaymentId(
        'enrollment-123',
        'pay-123',
      );

      expect(result.paymentId).toBe('pay-123');
      expect(mockDb.enrollment.update).toHaveBeenCalledWith({
        where: { id: 'enrollment-123' },
        data: { paymentId: 'pay-123' },
      });
    });
  });

  describe('findOneById', () => {
    it('should delegate to infra repository', async () => {
      mockInfraRepository.findOneById.mockResolvedValue(mockEnrollment);

      const result = await enrollmentRepository.findOneById('enrollment-123');

      expect(result).toBe(mockEnrollment);
      expect(mockInfraRepository.findOneById).toHaveBeenCalledWith(
        'enrollment-123',
      );
    });
  });

  describe('findByUserId', () => {
    it('should delegate to infra repository findMany', async () => {
      mockInfraRepository.findMany.mockResolvedValue([mockEnrollment]);

      const result = await enrollmentRepository.findByUserId('user-123');

      expect(result).toHaveLength(1);
      expect(mockInfraRepository.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findCourseById', () => {
    it('should delegate to infra repository', async () => {
      const mockCourse = { id: 'course-123', title: 'Test', price: 1000 };
      mockInfraRepository.findCourseById.mockResolvedValue(mockCourse);

      const result = await enrollmentRepository.findCourseById('course-123');

      expect(result).toBe(mockCourse);
      expect(mockInfraRepository.findCourseById).toHaveBeenCalledWith(
        'course-123',
      );
    });
  });

  describe('findByUserIdAndCourseId', () => {
    it('should delegate to infra repository', async () => {
      mockInfraRepository.findByUserIdAndCourseId.mockResolvedValue(
        mockEnrollment,
      );

      const result = await enrollmentRepository.findByUserIdAndCourseId(
        'user-123',
        'course-123',
      );

      expect(result).toBe(mockEnrollment);
      expect(mockInfraRepository.findByUserIdAndCourseId).toHaveBeenCalledWith(
        'user-123',
        'course-123',
      );
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
