import type { PaymentStatus } from '@/enums/payment-status.enum';

export class ApproveBankTransferOutput {
  paymentId: string;
  status: PaymentStatus;
  orderId: string;
  approved: boolean;
  reason?: string;
  updatedAt: Date;

  static create(data: ApproveBankTransferOutput): ApproveBankTransferOutput {
    return {
      paymentId: data.paymentId,
      status: data.status,
      orderId: data.orderId,
      approved: data.approved,
      reason: data.reason,
      updatedAt: data.updatedAt,
    };
  }
}
