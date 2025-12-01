import { BaseEntity } from '@/infrastructures/database/abstracts/base.entity';

export class PaymentEntity extends BaseEntity {
  paymentType: string;
  status: string;
  orderId: string | null;
  slipImage: string | null;
}
