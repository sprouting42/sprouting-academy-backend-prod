import { Injectable } from '@nestjs/common';

import type {
  CreateEnrollmentInput,
  IEnrollmentRepository,
} from '@/domains/enrollment/repositories/interfaces/enrollment.repository.interface';
import { EnrollmentDto } from '@/infrastructures/database/dto/enrollment.dto';
import { PrismaDatabase } from '@/infrastructures/database/prisma/prisma-database';
import { EnrollmentRepository as InfraEnrollmentRepository } from '@/infrastructures/database/repositories/enrollment.repository';

@Injectable()
export class EnrollmentRepository implements IEnrollmentRepository {
  static readonly TOKEN = Symbol('EnrollmentRepository');

  constructor(
    private readonly enrollmentRepository: InfraEnrollmentRepository,
    private readonly db: PrismaDatabase,
  ) {}

  async findOneById(id: string): Promise<EnrollmentDto | null> {
    return this.enrollmentRepository.findOneById(id);
  }

  async findByUserId(userId: string): Promise<EnrollmentDto[]> {
    return this.enrollmentRepository.findMany({
      where: { userId } as never,
      orderBy: { createdAt: 'desc' } as never,
    });
  }

  async createEnrollment(input: CreateEnrollmentInput): Promise<EnrollmentDto> {
    // Create enrollment without soft delete fields (use raw Prisma)
    const item = await this.db.enrollment.create({
      data: {
        userId: input.userId,
        courseId: input.courseId,
        paymentId: input.paymentId ?? null,
      },
    });

    return {
      id: item.id,
      userId: item.userId,
      courseId: item.courseId,
      paymentId: item.paymentId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    } as EnrollmentDto;
  }

  async updatePaymentId(id: string, paymentId: string): Promise<EnrollmentDto> {
    const item = await this.db.enrollment.update({
      where: { id },
      data: { paymentId },
    });

    return {
      id: item.id,
      userId: item.userId,
      courseId: item.courseId,
      paymentId: item.paymentId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    } as EnrollmentDto;
  }

  async findCourseById(id: string): Promise<{
    id: string;
    title: string;
    price: number;
  } | null> {
    return this.enrollmentRepository.findCourseById(id);
  }

  async findByUserIdAndCourseId(
    userId: string,
    courseId: string,
  ): Promise<EnrollmentDto | null> {
    return this.enrollmentRepository.findByUserIdAndCourseId(userId, courseId);
  }
}
