type RequiredFields = Pick<
  RetrieveChargeOutput,
  'id' | 'omiseChargeId' | 'amount' | 'status'
>;

export class RetrieveChargeOutput {
  readonly id: string;
  readonly enrollmentId: string | null;
  readonly omiseChargeId: string;
  readonly amount: number;
  readonly currency: string;
  readonly status: string;
  readonly paymentMethod: string;
  readonly failureCode: string | null;
  readonly failureMessage: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: RetrieveChargeOutput) {
    Object.assign(this, props);
  }

  static create(
    input: RequiredFields & Partial<RetrieveChargeOutput>,
  ): RetrieveChargeOutput {
    return new RetrieveChargeOutput({
      id: input.id,
      enrollmentId: input.enrollmentId ?? null,
      omiseChargeId: input.omiseChargeId,
      amount: input.amount,
      currency: input.currency ?? 'thb',
      status: input.status,
      paymentMethod: input.paymentMethod ?? 'Credit Card',
      failureCode: input.failureCode ?? null,
      failureMessage: input.failureMessage ?? null,
      createdAt: input.createdAt ?? new Date(),
      updatedAt: input.updatedAt ?? new Date(),
    });
  }
}
