import type {
  AuthOtpResponse,
  AuthResponse,
  UserResponse,
} from '@supabase/supabase-js';

import type { RefreshTokenInputDto } from '@/infrastructures/supabase/dto/refresh-token.dto';
import type { SignInWithOtpInputDto } from '@/infrastructures/supabase/dto/sign-in-with-otp.dto';
import type { VerifyOtpInputDto } from '@/infrastructures/supabase/dto/verify-otp.dto';

export interface ISupabaseManager {
  sendOtp(input: SignInWithOtpInputDto): Promise<AuthOtpResponse>;

  verifyOtp(input: VerifyOtpInputDto): Promise<AuthResponse>;

  signOut(token: string): Promise<{ error: Error | null }>;

  refreshSession(input: RefreshTokenInputDto): Promise<AuthResponse>;

  getUserFromToken(token: string): Promise<UserResponse>;
}
