export class CreateOrderInput {
  userId: string;
  subtotalAmount: number;
  totalAmount: number;
  orderStatus: string;
  couponId?: string | null;
}

export class CreateOrderItemInput {
  orderId: string;
  courseId: string;
  unitPrice: number;
}
