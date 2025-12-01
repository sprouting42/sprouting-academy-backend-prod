/**
 * Charge interface for Omise payment
 */
export interface ICharge {
  id: string;
  amount: number;
  currency: string;
  paid: boolean;
  description?: string;
  failure_code?: string;
  failure_message?: string;
}
