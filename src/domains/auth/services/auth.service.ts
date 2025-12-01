import { Inject, Injectable } from '@nestjs/common';

import { ERROR_CODES } from '@/common/errors/error-code';
import {
  MAPPING_ERROR_SUPABASE,
  SUPABASE_ERROR_CODE,
} from '@/common/errors/supabase-error-code';
import { ResponseOutputWithContent } from '@/common/response/response-output';
import { AuthRepository } from '@/domains/auth/repositories/auth.repository';
import type { IAuthRepository } from '@/domains/auth/repositories/interfaces/auth.repository.interface';
import { AuthOtpOutput } from '@/domains/auth/services/dto/auth-otp.output';
import { AuthRefreshTokenInput } from '@/domains/auth/services/dto/auth-refresh-token.input';
import { AuthRefreshTokenOutput } from '@/domains/auth/services/dto/auth-refresh-token.output';
import { AuthSignInWithOtpInput } from '@/domains/auth/services/dto/auth-sign-in-with-otp.input';
import { AuthSignOutOutput } from '@/domains/auth/services/dto/auth-sign-out.output';
import { AuthUserProfileOutput } from '@/domains/auth/services/dto/auth-user-profile.output';
import { AuthVerifyOtpInput } from '@/domains/auth/services/dto/auth-verify-otp.input';
import { AuthVerifyOtpOutput } from '@/domains/auth/services/dto/auth-verify-otp.output';
import { IAuthService } from '@/domains/auth/services/interfaces/auth.service.interface';
import { Language } from '@/enums/language.enum';
import type { ISupabaseManager } from '@/infrastructures/supabase/interfaces/supabase.service.interface';
import { SupabaseManager } from '@/infrastructures/supabase/services/supabase.manager';
import { AppLoggerService } from '@/modules/logger/services/app-logger.service';

@Injectable()
export class AuthService implements IAuthService {
  static readonly TOKEN = Symbol('AuthService');
  constructor(
    private readonly logger: AppLoggerService,
    @Inject(SupabaseManager.TOKEN)
    private readonly supabaseManager: ISupabaseManager,
    @Inject(AuthRepository.TOKEN)
    private readonly authRepository: IAuthRepository,
  ) {}

  async signInWithOtp(
    language: Language,
    input: AuthSignInWithOtpInput,
  ): Promise<ResponseOutputWithContent<AuthSignInWithOtpInput, AuthOtpOutput>> {
    const { error } = await this.supabaseManager.sendOtp({
      ...input,
    });

    if (error !== null && error !== undefined) {
      const errMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send OTP [Language: ${language}]`,
        errMessage,
      );

      const mappedError =
        MAPPING_ERROR_SUPABASE[error.code as SUPABASE_ERROR_CODE] ??
        ERROR_CODES.AUTH.SIGN_IN_ERROR;

      return ResponseOutputWithContent.failWithContent(
        mappedError,
        input,
        language,
      );
    }

    const result = AuthOtpOutput.create({
      message: 'OTP sent to your email',
      email: input.email,
    });

    return ResponseOutputWithContent.successWithContent(input, result);
  }

  async verifyOtp(
    language: Language,
    input: AuthVerifyOtpInput,
  ): Promise<
    ResponseOutputWithContent<AuthVerifyOtpInput, AuthVerifyOtpOutput>
  > {
    // 1. Verify OTP with Supabase

    const { data, error } = await this.supabaseManager.verifyOtp({
      email: input.email,
      token: input.otp,
      type: 'email',
    });

    if (error !== null && error !== undefined) {
      const errMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to verify OTP', errMessage);

      const mappedError =
        MAPPING_ERROR_SUPABASE[error.code as SUPABASE_ERROR_CODE] ??
        ERROR_CODES.AUTH.SIGN_IN_ERROR;

      return ResponseOutputWithContent.failWithContent(
        mappedError,
        input,
        language,
      );
    }

    if (!data.user || !data.session) {
      this.logger.error('Verify OTP succeeded but no user or session returned');
      return ResponseOutputWithContent.failWithContent(
        ERROR_CODES.AUTH.SIGN_IN_ERROR,
        input,
        language,
      );
    }

    const userId = data.user.id;

    // 2. Check if user exists in our database

    let user = await this.authRepository.findUserById(userId);

    // 3. If not exists, create new user profile (first-time sign in)
    if (!user) {
      this.logger.log(`Creating new user profile for userId: ${userId}`);

      user = await this.authRepository.createUser({
        id: userId,

        email: data.user.email ?? input.email,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        fullName:
          data.user.user_metadata?.full_name ??
          data.user.user_metadata?.fullName ??
          'User',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        phone: data.user.user_metadata?.phone ?? data.user.phone ?? undefined,
      });
    }

    // 4. Create output with tokens and user profile

    const result = AuthVerifyOtpOutput.create({
      accessToken: data.session.access_token,
      tokenType: 'bearer',

      expiresIn: data.session.expires_in ?? 3600,

      expiresAt: data.session.expires_at ?? 0,

      refreshToken: data.session.refresh_token,
      user: AuthUserProfileOutput.create(user),
    });

    return ResponseOutputWithContent.successWithContent(input, result);
  }

  async signOut(
    language: Language,
    token: string | undefined,
  ): Promise<ResponseOutputWithContent<string | undefined, AuthSignOutOutput>> {
    if (token === undefined || token === '') {
      return ResponseOutputWithContent.failWithContent(
        ERROR_CODES.AUTH.TOKEN_REQUIRED,
        token,
        language,
      );
    }

    const { error } = await this.supabaseManager.signOut(token);

    if (error !== null && error !== undefined) {
      const errMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to sign out', errMessage);

      return ResponseOutputWithContent.failWithContent(
        ERROR_CODES.AUTH.SIGN_IN_ERROR,
        token,
        language,
      );
    }

    const result = AuthSignOutOutput.create({
      message: 'Successfully signed out',
    });

    return ResponseOutputWithContent.successWithContent(token, result);
  }

  async refreshToken(
    language: Language,
    input: AuthRefreshTokenInput,
  ): Promise<
    ResponseOutputWithContent<AuthRefreshTokenInput, AuthRefreshTokenOutput>
  > {
    const { data, error } = await this.supabaseManager.refreshSession({
      refreshToken: input.refreshToken,
    });

    if (error) {
      const errMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to refresh token', errMessage);

      return ResponseOutputWithContent.failWithContent(
        ERROR_CODES.AUTH.SIGN_IN_ERROR,
        input,
        language,
      );
    }

    if (!data.session) {
      this.logger.error('No session returned from refresh token');

      return ResponseOutputWithContent.failWithContent(
        ERROR_CODES.AUTH.SIGN_IN_ERROR,
        input,
        language,
      );
    }

    const result = AuthRefreshTokenOutput.create({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in ?? 3600,
      tokenType: 'bearer',
    });

    return ResponseOutputWithContent.successWithContent(input, result);
  }

  async getUserProfile(
    language: Language,
    userId: string,
  ): Promise<ResponseOutputWithContent<string, AuthUserProfileOutput>> {
    const user = await this.authRepository.findUserById(userId);

    if (user === null || user === undefined) {
      return ResponseOutputWithContent.failWithContent(
        ERROR_CODES.AUTH.USER_NOT_FOUND,
        userId,
        language,
      );
    }

    return ResponseOutputWithContent.successWithContent(
      userId,
      AuthUserProfileOutput.create(user),
    );
  }
}
