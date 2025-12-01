import type { ResponseOutputWithContent } from '@/common/response/response-output';
import type { AuthOtpOutput } from '@/domains/auth/services/dto/auth-otp.output';
import type { AuthRefreshTokenInput } from '@/domains/auth/services/dto/auth-refresh-token.input';
import type { AuthRefreshTokenOutput } from '@/domains/auth/services/dto/auth-refresh-token.output';
import type { AuthSignInWithOtpInput } from '@/domains/auth/services/dto/auth-sign-in-with-otp.input';
import type { AuthSignOutOutput } from '@/domains/auth/services/dto/auth-sign-out.output';
import type { AuthUserProfileOutput } from '@/domains/auth/services/dto/auth-user-profile.output';
import type { AuthVerifyOtpInput } from '@/domains/auth/services/dto/auth-verify-otp.input';
import type { AuthVerifyOtpOutput } from '@/domains/auth/services/dto/auth-verify-otp.output';
import type { Language } from '@/enums/language.enum';

export interface IAuthService {
  signInWithOtp(
    language: Language,
    input: AuthSignInWithOtpInput,
  ): Promise<ResponseOutputWithContent<AuthSignInWithOtpInput, AuthOtpOutput>>;

  verifyOtp(
    language: Language,
    input: AuthVerifyOtpInput,
  ): Promise<
    ResponseOutputWithContent<AuthVerifyOtpInput, AuthVerifyOtpOutput>
  >;

  signOut(
    language: Language,
    token: string | undefined,
  ): Promise<ResponseOutputWithContent<string | undefined, AuthSignOutOutput>>;

  refreshToken(
    language: Language,
    input: AuthRefreshTokenInput,
  ): Promise<
    ResponseOutputWithContent<AuthRefreshTokenInput, AuthRefreshTokenOutput>
  >;

  getUserProfile(
    language: Language,
    userId: string,
  ): Promise<ResponseOutputWithContent<string, AuthUserProfileOutput>>;
}
