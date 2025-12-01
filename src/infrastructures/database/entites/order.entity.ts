import type { Order } from '@prisma/client';
import type { Decimal } from '@prisma/client/runtime/client';

export class OrderEntity implements Order {
  id: string;
  createdAt: Date;
  subtotalAmount: Decimal;
  totalAmount: Decimal;
  orderStatus: string;
  couponId: string | null;
  userId: string;
}
