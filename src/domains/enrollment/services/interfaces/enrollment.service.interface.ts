import type { ResponseOutputWithContent } from '@/common/response/response-output';
import type { CreateEnrollmentInput } from '@/domains/enrollment/services/dto/create-enrollment.input';
import type { CreateEnrollmentOutput } from '@/domains/enrollment/services/dto/create-enrollment.output';
import type { EnrollmentOutput } from '@/domains/enrollment/services/dto/enrollment.output';

export interface IEnrollmentService {
  createEnrollment(
    input: CreateEnrollmentInput,
  ): Promise<
    ResponseOutputWithContent<CreateEnrollmentInput, CreateEnrollmentOutput>
  >;

  getEnrollmentById(
    id: string,
  ): Promise<ResponseOutputWithContent<{ id: string }, EnrollmentOutput>>;

  getMyEnrollments(
    userId: string,
  ): Promise<ResponseOutputWithContent<{ userId: string }, EnrollmentOutput[]>>;
}
