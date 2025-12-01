/**
 * Bank Transfer Status Enum
 * Note: Bank Transfer uses PaymentStatus enum values (lowercase)
 * This enum is kept for backward compatibility but maps to lowercase values
 */
export enum BankTransferStatus {
  PENDING = 'pending',
  APPROVED = 'successful',
  REJECTED = 'rejected',
}
