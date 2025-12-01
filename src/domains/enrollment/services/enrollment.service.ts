import { HttpStatus, Inject, Injectable } from '@nestjs/common';

import { ERROR_CODES } from '@/common/errors/error-code';
import { ResponseOutputWithContent } from '@/common/response/response-output';
import { EnrollmentRepository } from '@/domains/enrollment/repositories/enrollment.repository';
import type { IEnrollmentRepository } from '@/domains/enrollment/repositories/interfaces/enrollment.repository.interface';
import type { CreateEnrollmentInput } from '@/domains/enrollment/services/dto/create-enrollment.input';
import { CreateEnrollmentOutput } from '@/domains/enrollment/services/dto/create-enrollment.output';
import { EnrollmentOutput } from '@/domains/enrollment/services/dto/enrollment.output';
import type { IEnrollmentService } from '@/domains/enrollment/services/interfaces/enrollment.service.interface';
import { AppLoggerService } from '@/modules/logger/services/app-logger.service';

@Injectable()
export class EnrollmentService implements IEnrollmentService {
  static readonly TOKEN = Symbol('EnrollmentService');

  constructor(
    @Inject(EnrollmentRepository.TOKEN)
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly logger: AppLoggerService,
  ) {}

  async createEnrollment(
    input: CreateEnrollmentInput,
  ): Promise<
    ResponseOutputWithContent<CreateEnrollmentInput, CreateEnrollmentOutput>
  > {
    this.logger.debug(
      `Creating enrollment: userId=${input.userId}, courseId=${input.courseId}`,
      EnrollmentService.name,
    );

    try {
      // 1. Check if course exists
      const course = await this.enrollmentRepository.findCourseById(
        input.courseId,
      );

      if (!course) {
        this.logger.warn(
          `Course not found: ${input.courseId}`,
          EnrollmentService.name,
        );
        return ResponseOutputWithContent.failWithContent(
          ERROR_CODES.ENROLLMENT.COURSE_NOT_FOUND,
          input,
        );
      }

      // 2. Check if user already enrolled in this course
      const existingEnrollment =
        await this.enrollmentRepository.findByUserIdAndCourseId(
          input.userId,
          input.courseId,
        );

      if (existingEnrollment) {
        this.logger.warn(
          `User already enrolled: userId=${input.userId}, courseId=${input.courseId}`,
          EnrollmentService.name,
        );
        return ResponseOutputWithContent.failWithContent(
          ERROR_CODES.ENROLLMENT.ALREADY_ENROLLED,
          input,
        );
      }

      // 3. Create enrollment (store course ID)
      const enrollment = await this.enrollmentRepository.createEnrollment({
        userId: input.userId,
        courseId: input.courseId,
        paymentId: null, // Not paid yet
      });

      // 4. Create output
      const output = CreateEnrollmentOutput.create({
        id: enrollment.id,
        userId: enrollment.userId,
        course: course.title, // Use course.title for output
        coursePrice: course.price,
        paymentId: enrollment.paymentId,
        createdAt: enrollment.createdAt,
        updatedAt: enrollment.updatedAt,
      });

      this.logger.log(
        `Enrollment created successfully: ${enrollment.id}`,
        EnrollmentService.name,
      );

      return ResponseOutputWithContent.successWithContent(
        input,
        output,
        HttpStatus.CREATED,
      );
    } catch (error) {
      this.logger.error(
        `Error creating enrollment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        EnrollmentService.name,
      );

      return ResponseOutputWithContent.failWithContent(
        ERROR_CODES.ENROLLMENT.INTERNAL_SERVER_ERROR,
        input,
      );
    }
  }

  async getEnrollmentById(
    id: string,
  ): Promise<ResponseOutputWithContent<{ id: string }, EnrollmentOutput>> {
    this.logger.debug(
      `Getting enrollment by ID: ${id}`,
      EnrollmentService.name,
    );

    try {
      const enrollment = await this.enrollmentRepository.findOneById(id);

      if (!enrollment) {
        this.logger.warn(`Enrollment not found: ${id}`, EnrollmentService.name);
        return ResponseOutputWithContent.failWithContent(
          ERROR_CODES.ENROLLMENT.ENROLLMENT_NOT_FOUND,
          { id },
        );
      }

      // Get course title from courseId
      const course = await this.enrollmentRepository.findCourseById(
        enrollment.courseId,
      );
      const courseTitle = course?.title ?? 'Unknown Course';

      const output = EnrollmentOutput.create({
        id: enrollment.id,
        userId: enrollment.userId,
        course: courseTitle,
        paymentId: enrollment.paymentId,
        createdAt: enrollment.createdAt,
        updatedAt: enrollment.updatedAt,
      });

      return ResponseOutputWithContent.successWithContent({ id }, output);
    } catch (error) {
      this.logger.error(
        `Error getting enrollment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        EnrollmentService.name,
      );

      return ResponseOutputWithContent.failWithContent(
        ERROR_CODES.ENROLLMENT.INTERNAL_SERVER_ERROR,
        { id },
      );
    }
  }

  async getMyEnrollments(
    userId: string,
  ): Promise<
    ResponseOutputWithContent<{ userId: string }, EnrollmentOutput[]>
  > {
    this.logger.debug(
      `Getting enrollments for user: ${userId}`,
      EnrollmentService.name,
    );

    try {
      const enrollments = await this.enrollmentRepository.findByUserId(userId);

      // Map enrollments to outputs, getting course title for each
      const outputs = await Promise.all(
        enrollments.map(async enrollment => {
          const course = await this.enrollmentRepository.findCourseById(
            enrollment.courseId,
          );
          const courseTitle = course?.title ?? 'Unknown Course';

          return EnrollmentOutput.create({
            id: enrollment.id,
            userId: enrollment.userId,
            course: courseTitle,
            paymentId: enrollment.paymentId,
            createdAt: enrollment.createdAt,
            updatedAt: enrollment.updatedAt,
          });
        }),
      );

      return ResponseOutputWithContent.successWithContent({ userId }, outputs);
    } catch (error) {
      this.logger.error(
        `Error getting enrollments: ${error instanceof Error ? error.message : 'Unknown error'}`,
        EnrollmentService.name,
      );

      return ResponseOutputWithContent.failWithContent(
        ERROR_CODES.ENROLLMENT.INTERNAL_SERVER_ERROR,
        { userId },
      );
    }
  }
}
