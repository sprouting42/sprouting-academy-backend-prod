import type { OrderItem } from '@prisma/client';
import type { Decimal } from '@prisma/client/runtime/client';

export class OrderItemEntity implements OrderItem {
  id: string;
  createdAt: Date;
  courseId: string;
  orderId: string;
  unitPrice: Decimal;
}
