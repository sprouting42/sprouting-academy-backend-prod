type RequiredFields = Pick<EnrollmentOutput, 'id' | 'userId' | 'course'>;

export class EnrollmentOutput {
  readonly id: string;
  readonly userId: string;
  readonly course: string;
  readonly paymentId: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: EnrollmentOutput) {
    Object.assign(this, props);
  }

  static create(
    input: RequiredFields & Partial<EnrollmentOutput>,
  ): EnrollmentOutput {
    return new EnrollmentOutput({
      id: input.id,
      userId: input.userId,
      course: input.course,
      paymentId: input.paymentId ?? null,
      createdAt: input.createdAt ?? new Date(),
      updatedAt: input.updatedAt ?? new Date(),
    });
  }
}
