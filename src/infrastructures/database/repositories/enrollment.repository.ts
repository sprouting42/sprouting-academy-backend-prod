import { Injectable, Scope } from '@nestjs/common';

import type { CreateEnrollmentInput } from '@/domains/enrollment/repositories/interfaces/enrollment.repository.interface';
import { BaseRepository } from '@/infrastructures/database/abstracts/base.repository';
import { EnrollmentDto } from '@/infrastructures/database/dto/enrollment.dto';
import { EnrollmentEntity } from '@/infrastructures/database/entites/enrollment.entity';
import { PrismaDatabase } from '@/infrastructures/database/prisma/prisma-database';

@Injectable({ scope: Scope.REQUEST })
export class EnrollmentRepository extends BaseRepository<
  EnrollmentEntity,
  EnrollmentDto,
  PrismaDatabase['enrollment']
> {
  static readonly TOKEN = Symbol('EnrollmentRepository');
  constructor(private readonly db: PrismaDatabase) {
    super(db.enrollment, EnrollmentDto);
  }

  async findCourseById(id: string) {
    const course = await this.db.course.findUnique({
      where: { id },
      select: {
        id: true,
        coursesTitle: true,
        normalPrice: true,
      },
    });

    if (!course) {
      return null;
    }

    return {
      id: course.id,
      title: course.coursesTitle,
      price: Number(course.normalPrice),
    };
  }

  async findByUserId(userId: string): Promise<EnrollmentDto[]> {
    const enrollments = await this.db.enrollment.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    return enrollments.map(enrollment => ({
      id: enrollment.id,
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      paymentId: enrollment.paymentId,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
    })) as EnrollmentDto[];
  }

  async findByUserIdAndCourseId(userId: string, courseId: string) {
    const enrollment = await this.db.enrollment.findFirst({
      where: {
        userId,
        courseId,
        deletedAt: null,
      },
    });

    if (!enrollment) {
      return null;
    }

    return {
      id: enrollment.id,
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      paymentId: enrollment.paymentId,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
    } as EnrollmentDto;
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
}
