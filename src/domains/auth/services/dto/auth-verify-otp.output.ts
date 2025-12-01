import type { AuthUserProfileOutput } from '@/domains/auth/services/dto/auth-user-profile.output';

type RequiredFields = Pick<
  AuthVerifyOtpOutput,
  | 'accessToken'
  | 'tokenType'
  | 'expiresIn'
  | 'expiresAt'
  | 'refreshToken'
  | 'user'
>;

export class AuthVerifyOtpOutput {
  readonly accessToken: string;
  readonly tokenType: string;
  readonly expiresIn: number;
  readonly expiresAt: number;
  readonly refreshToken: string;
  readonly user: AuthUserProfileOutput;

  private constructor(props: AuthVerifyOtpOutput) {
    Object.assign(this, props);
  }

  static create(input: RequiredFields): AuthVerifyOtpOutput {
    return new AuthVerifyOtpOutput({
      accessToken: input.accessToken,
      tokenType: input.tokenType,
      expiresIn: input.expiresIn,
      expiresAt: input.expiresAt,
      refreshToken: input.refreshToken,
      user: input.user,
    });
  }
}
