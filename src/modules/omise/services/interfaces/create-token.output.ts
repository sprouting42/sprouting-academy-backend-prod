/**
 * Output from Omise token creation
 */
export interface CreateTokenOutput {
  /** Omise token ID (e.g., "tokn_test_xxxxx") */
  id: string;
  /** Whether the token was created successfully */
  livemode: boolean;
  /** Location of the token resource */
  location: string;
  /** Card information (masked) */
  card: {
    id: string;
    /** Last 4 digits of card number */
    lastDigits: string;
    /** Card brand (e.g., "Visa", "MasterCard") */
    brand: string;
    /** Cardholder name */
    name: string;
    /** Expiry month */
    expirationMonth: number;
    /** Expiry year */
    expirationYear: number;
    /** Card fingerprint */
    fingerprint: string;
    /** Card funding type (e.g., "credit", "debit") */
    funding: string;
  };
  /** Token creation timestamp */
  created: string;
}
