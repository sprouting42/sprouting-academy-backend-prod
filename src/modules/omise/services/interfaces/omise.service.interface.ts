import type { ICharge } from '@/domains/payment/services/interfaces/payment.interface';

import type { CreateTokenInput } from './create-token.input';
import type { CreateTokenOutput } from './create-token.output';

export interface IOmiseService {
  /**
   * Get Omise Public Key for frontend token creation
   * @returns Public key string
   */
  getPublicKey(): string;

  /**
   * Create Omise token from card details
   * This method creates a token server-side using Omise SDK
   * @param input - Card details for token creation
   * @returns Promise<CreateTokenOutput>
   */
  createToken(input: CreateTokenInput): Promise<CreateTokenOutput>;

  createCharge(
    amount: number,
    token: string,
    description?: string,
  ): Promise<ICharge>;

  retrieveCharge(chargeId: string): Promise<ICharge>;
}
