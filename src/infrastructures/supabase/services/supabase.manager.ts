import { Inject, Injectable } from '@nestjs/common';
import type {
  AuthOtpResponse,
  AuthResponse,
  UserResponse,
} from '@supabase/supabase-js';

import { RefreshTokenInputDto } from '@/infrastructures/supabase/dto/refresh-token.dto';
import { SignInWithOtpInputDto } from '@/infrastructures/supabase/dto/sign-in-with-otp.dto';
import { VerifyOtpInputDto } from '@/infrastructures/supabase/dto/verify-otp.dto';
import { ISupabaseConnector } from '@/infrastructures/supabase/interfaces/supabase-connector.interface';
import { ISupabaseManager } from '@/infrastructures/supabase/interfaces/supabase.service.interface';
import { SupabaseConnector } from '@/infrastructures/supabase/services/supabase-connector';
import { AppLoggerService } from '@/modules/logger/services/app-logger.service';

@Injectable()
export class SupabaseManager implements ISupabaseManager {
  static readonly TOKEN = Symbol('SupabaseManager');

  constructor(
    @Inject(SupabaseConnector.TOKEN)
    private readonly supabaseClientFactory: ISupabaseConnector,
    private readonly logger: AppLoggerService,
  ) {}

  sendOtp(input: SignInWithOtpInputDto): Promise<AuthOtpResponse> {
    this.logger.debug(
      `Sending OTP to email: ${input.email}`,
      SupabaseManager.name,
    );

    const supabase = this.supabaseClientFactory.getClient();

    return supabase.auth.signInWithOtp({
      email: input.email,
      options: {
        emailRedirectTo: undefined, // Server-side OTP flow (no redirect)
        shouldCreateUser: true,
        data: {
          full_name: input.fullName,
          phone: input.phone,
        },
      },
    });
  }

  verifyOtp(input: VerifyOtpInputDto): Promise<AuthResponse> {
    this.logger.debug(
      `Verifying OTP for email: ${input.email}`,
      SupabaseManager.name,
    );

    const supabase = this.supabaseClientFactory.getClient();

    return supabase.auth.verifyOtp({
      email: input.email,
      token: input.token,
      type: 'email',
    });
  }

  async signOut(token: string): Promise<{ error: Error | null }> {
    this.logger.debug('Signing out user', SupabaseManager.name);

    const supabase = this.supabaseClientFactory.getClientWithAuth(token);

    return supabase.auth.signOut();
  }

  refreshSession(input: RefreshTokenInputDto): Promise<AuthResponse> {
    this.logger.debug(
      'Refreshing session with refresh token',
      SupabaseManager.name,
    );

    const supabase = this.supabaseClientFactory.getClient();

    return supabase.auth.refreshSession({
      refresh_token: input.refreshToken,
    });
  }

  getUserFromToken(token: string): Promise<UserResponse> {
    this.logger.debug(
      `Validating user from token: ${token.substring(0, 10)}...`,
      SupabaseManager.name,
    );

    const supabase = this.supabaseClientFactory.getClientWithAuth(token);

    return supabase.auth.getUser();
  }
}
