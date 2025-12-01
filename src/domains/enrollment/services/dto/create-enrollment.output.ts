type RequiredFields = Pick<
  CreateEnrollmentOutput,
  'id' | 'userId' | 'course' | 'coursePrice'
>;

export class CreateEnrollmentOutput {
  readonly id: string;
  readonly userId: string;
  readonly course: string;
  readonly coursePrice: number;
  readonly paymentId: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: CreateEnrollmentOutput) {
    Object.assign(this, props);
  }

  static create(
    input: RequiredFields & Partial<CreateEnrollmentOutput>,
  ): CreateEnrollmentOutput {
    return new CreateEnrollmentOutput({
      id: input.id,
      userId: input.userId,
      course: input.course,
      coursePrice: input.coursePrice,
      paymentId: input.paymentId ?? null,
      createdAt: input.createdAt ?? new Date(),
      updatedAt: input.updatedAt ?? new Date(),
    });
  }
}
