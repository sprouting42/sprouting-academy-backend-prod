export class ApproveBankTransferInput {
  paymentId: string;
  approved: boolean;
  reason?: string;
}
