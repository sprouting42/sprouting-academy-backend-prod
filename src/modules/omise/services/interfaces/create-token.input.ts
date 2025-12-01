/**
 * Input for creating Omise token from card details
 */
export interface CreateTokenInput {
  /** Card number (e.g., "4242424242424242") */
  cardNumber: string;
  /** Cardholder name */
  cardName: string;
  /** Expiry month (1-12) */
  expirationMonth: number;
  /** Expiry year (e.g., 2025) */
  expirationYear: number;
  /** CVV/CVC security code */
  securityCode: string;
  /** City (optional) */
  city?: string;
  /** Postal code (optional) */
  postalCode?: string;
}
