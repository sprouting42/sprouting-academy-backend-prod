export class OrderOutput {
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

  private constructor(props: OrderOutput) {
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
  }): OrderOutput {
    return new OrderOutput({
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
