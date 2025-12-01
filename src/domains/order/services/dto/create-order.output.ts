export class CreateOrderOutput {
  readonly id: string;
  readonly subtotalAmount: number;
  readonly totalAmount: number;
  readonly orderStatus: string;
  readonly items: {
    id: string;
    courseId: string;
    unitPrice: number;
    createdAt: Date;
  }[];
  readonly couponId: string | null;
  readonly createdAt: Date;

  private constructor(props: CreateOrderOutput) {
    Object.assign(this, props);
  }

  static create(input: {
    id: string;
    subtotalAmount: number;
    totalAmount: number;
    orderStatus: string;
    items: {
      id: string;
      courseId: string;
      unitPrice: number;
      createdAt: Date;
    }[];
    couponId: string | null;
    createdAt: Date;
  }): CreateOrderOutput {
    return new CreateOrderOutput({
      id: input.id,
      subtotalAmount: input.subtotalAmount,
      totalAmount: input.totalAmount,
      orderStatus: input.orderStatus,
      items: input.items,
      couponId: input.couponId,
      createdAt: input.createdAt,
    });
  }
}
