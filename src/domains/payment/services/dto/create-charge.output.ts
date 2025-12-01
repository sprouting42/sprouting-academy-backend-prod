type RequiredFields = Pick<
  CreateChargeOutput,
  'id' | 'omiseChargeId' | 'amount' | 'status'
>;

export class CreateChargeOutput {
  readonly id: string;
  readonly enrollmentId: string | null;
  readonly omiseChargeId: string;
  readonly amount: number;
  readonly currency: string;
  readonly status: string;
  readonly paymentMethod: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: CreateChargeOutput) {
    Object.assign(this, props);
  }

  static create(
    input: RequiredFields & Partial<CreateChargeOutput>,
  ): CreateChargeOutput {
    return new CreateChargeOutput({
      id: input.id,
      enrollmentId: input.enrollmentId ?? null,
      omiseChargeId: input.omiseChargeId,
      amount: input.amount,
      currency: input.currency ?? 'thb',
      status: input.status,
      paymentMethod: input.paymentMethod ?? 'Credit Card',
      createdAt: input.createdAt ?? new Date(),
      updatedAt: input.updatedAt ?? new Date(),
    });
  }
}
