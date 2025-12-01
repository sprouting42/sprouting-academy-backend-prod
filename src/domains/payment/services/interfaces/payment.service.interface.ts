import type { ResponseOutputWithContent } from '@/common/response/response-output';
import type { ApproveBankTransferInput } from '@/domains/payment/services/dto/approve-bank-transfer.input';
import type { ApproveBankTransferOutput } from '@/domains/payment/services/dto/approve-bank-transfer.output';
import type { BankTransferOutput } from '@/domains/payment/services/dto/bank-transfer.output';
import type { CreateBankTransferInput } from '@/domains/payment/services/dto/create-bank-transfer.input';
import type { CreateChargeInput } from '@/domains/payment/services/dto/create-charge.input';
import type { CreateChargeOutput } from '@/domains/payment/services/dto/create-charge.output';
import type { RetrieveChargeInput } from '@/domains/payment/services/dto/retrieve-charge.input';
import type { RetrieveChargeOutput } from '@/domains/payment/services/dto/retrieve-charge.output';
import type { PaymentDto } from '@/infrastructures/database/dto/payment.dto';

// Type alias for Multer file
type MulterFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

export interface IPaymentService {
  // Credit Card (Omise)
  createCharge(
    input: CreateChargeInput,
  ): Promise<ResponseOutputWithContent<CreateChargeInput, CreateChargeOutput>>;

  retrieveCharge(
    input: RetrieveChargeInput,
  ): Promise<
    ResponseOutputWithContent<RetrieveChargeInput, RetrieveChargeOutput>
  >;

  // Bank Transfer
  createBankTransferPayment(
    file: MulterFile,
    input: CreateBankTransferInput,
  ): Promise<
    ResponseOutputWithContent<CreateBankTransferInput, BankTransferOutput>
  >;

  approveBankTransferPayment(
    input: ApproveBankTransferInput,
  ): Promise<
    ResponseOutputWithContent<
      ApproveBankTransferInput,
      ApproveBankTransferOutput
    >
  >;

  // Generic Payment Methods
  getPayments(filters: {
    type?: string;
    status?: string;
  }): Promise<PaymentDto[]>;
  getMyPayments(userId: string): Promise<PaymentDto[]>;
}
