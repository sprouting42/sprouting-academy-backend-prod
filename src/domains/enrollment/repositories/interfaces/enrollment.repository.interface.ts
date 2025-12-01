import type { EnrollmentDto } from '@/infrastructures/database/dto/enrollment.dto';

export type CreateEnrollmentInput = {
  userId: string;
  courseId: string;
  paymentId?: string | null;
};

export interface IEnrollmentRepository {
  findOneById(id: string): Promise<EnrollmentDto | null>;
  findByUserId(userId: string): Promise<EnrollmentDto[]>;
  findByUserIdAndCourseId(
    userId: string,
    courseId: string,
  ): Promise<EnrollmentDto | null>;
  createEnrollment(input: CreateEnrollmentInput): Promise<EnrollmentDto>;
  updatePaymentId(id: string, paymentId: string): Promise<EnrollmentDto>;
  findCourseById(id: string): Promise<{
    id: string;
    title: string;
    price: number;
  } | null>;
}
