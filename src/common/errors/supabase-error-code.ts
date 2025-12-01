import { ERROR_CODES } from '@/common/errors/error-code';
import type { ErrorCode } from '@/common/errors/types/error-code.type';

export enum SUPABASE_ERROR_CODE {
  OVER_EMAIL_SEND_RATE_LIMIT = 'over_email_send_rate_limit',
  OTP_EXPIRED = 'otp_expired',
}

export const MAPPING_ERROR_SUPABASE: Record<SUPABASE_ERROR_CODE, ErrorCode> = {
  [SUPABASE_ERROR_CODE.OVER_EMAIL_SEND_RATE_LIMIT]:
    ERROR_CODES.AUTH.OVER_EMAIL_SEND_RATE_LIMIT,
  [SUPABASE_ERROR_CODE.OTP_EXPIRED]: ERROR_CODES.AUTH.OTP_EXPIRED,
} as const;
