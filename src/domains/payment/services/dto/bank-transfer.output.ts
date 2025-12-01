type RequiredFields = Pick<
  BankTransferOutput,
  'id' | 'amount' | 'status' | 'slipImage'
>;

export class BankTransferOutput {
  readonly id: string;
  readonly enrollmentId: string | null;
  readonly paymentType: string;
  readonly amount: number;
  readonly status: string;
  readonly slipImage: string;
  readonly couponId: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: BankTransferOutput) {
    Object.assign(this, props);
  }

  static create(
    input: RequiredFields & Partial<BankTransferOutput>,
  ): BankTransferOutput {
    return new BankTransferOutput({
      id: input.id,
      enrollmentId: input.enrollmentId ?? null,
      paymentType: input.paymentType ?? 'Bank Transfer',
      amount: input.amount,
      status: input.status,
      slipImage: input.slipImage,
      couponId: input.couponId ?? null,
      createdAt: input.createdAt ?? new Date(),
      updatedAt: input.updatedAt ?? new Date(),
    });
  }
}
