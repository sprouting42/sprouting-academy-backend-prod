import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { BaseController } from '@/common/controllers/base.controller';
import { AuthToken } from '@/common/decorators/auth-token.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CurrentLanguage } from '@/common/decorators/language.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { ApiDocLanguageHeader } from '@/common/docs/api-language-header.doc';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { ResponseContent } from '@/common/response/response-content';
import { API_CONTROLLER_CONFIG } from '@/constants/api-controller';
import { OtpSentResponse } from '@/domains/auth/controller/contracts/otp.response';
import { RefreshTokenRequestBody } from '@/domains/auth/controller/contracts/refresh-token.request';
import { RefreshTokenResponse } from '@/domains/auth/controller/contracts/refresh-token.response';
import { SignInWithOtpRequestBody } from '@/domains/auth/controller/contracts/sign-in-with-otp.request';
import { SignOutResponse } from '@/domains/auth/controller/contracts/sign-out.response';
import { UserProfileResponse } from '@/domains/auth/controller/contracts/user-profile.reponse';
import { VerifyOtpRequestBody } from '@/domains/auth/controller/contracts/verify-otp.request';
import { VerifyOtpResponse } from '@/domains/auth/controller/contracts/verify-otp.response';
import { ApiDocGetMeDoc } from '@/domains/auth/controller/docs/auth-get-me';
import { ApiDocRefreshTokenDoc } from '@/domains/auth/controller/docs/auth-refresh-token';
import { ApiDocSignInWithOtpDoc } from '@/domains/auth/controller/docs/auth-sign-in-with-otp';
import { ApiDocSignOutDoc } from '@/domains/auth/controller/docs/auth-sign-out';
import { ApiDocVerifyOtpDoc } from '@/domains/auth/controller/docs/auth-verify-otp';
import { AuthService } from '@/domains/auth/services/auth.service';
import type { IAuthService } from '@/domains/auth/services/interfaces/auth.service.interface';
import { Language } from '@/enums/language.enum';
import { UserAccount } from '@/infrastructures/database/dto/user-account.dto';

@UseGuards(AuthenticationGuard)
@ApiTags(API_CONTROLLER_CONFIG.AUTH.TAG)
@ApiDocLanguageHeader()
@Controller(API_CONTROLLER_CONFIG.AUTH.PREFIX)
export class AuthController extends BaseController {
  constructor(
    @Inject(AuthService.TOKEN)
    private readonly authService: IAuthService,
  ) {
    super();
  }

  @Public()
  @Post(API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN)
  @ApiDocSignInWithOtpDoc()
  @HttpCode(HttpStatus.OK)
  async signInWithOtp(
    @Body() body: SignInWithOtpRequestBody,
    @CurrentLanguage() language: Language,
  ): Promise<ResponseContent<OtpSentResponse>> {
    try {
      const result = await this.authService.signInWithOtp(language, body);

      return this.actionResponse<OtpSentResponse, SignInWithOtpRequestBody>(
        result,
      );
    } catch (error) {
      return this.actionResponseError(language, error);
    }
  }

  @Public()
  @Post(API_CONTROLLER_CONFIG.AUTH.ROUTE.VERIFY_OTP)
  @ApiDocVerifyOtpDoc()
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body() body: VerifyOtpRequestBody,
    @CurrentLanguage() language: Language,
  ): Promise<ResponseContent<VerifyOtpResponse>> {
    try {
      const result = await this.authService.verifyOtp(language, body);

      return this.actionResponse<VerifyOtpResponse, VerifyOtpRequestBody>(
        result,
      );
    } catch (error) {
      return this.actionResponseError(language, error);
    }
  }

  @Public()
  @Post(API_CONTROLLER_CONFIG.AUTH.ROUTE.SIGN_OUT)
  @ApiDocSignOutDoc()
  @HttpCode(HttpStatus.OK)
  async signOut(
    @AuthToken() token: string | undefined,
    @CurrentLanguage() language: Language,
  ): Promise<ResponseContent<SignOutResponse>> {
    try {
      const result = await this.authService.signOut(language, token);

      return this.actionResponse<SignOutResponse, string | undefined>(result);
    } catch (error) {
      return this.actionResponseError(language, error);
    }
  }

  @Public()
  @Post(API_CONTROLLER_CONFIG.AUTH.ROUTE.REFRESH)
  @ApiDocRefreshTokenDoc()
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() body: RefreshTokenRequestBody,
    @CurrentLanguage() language: Language,
  ): Promise<ResponseContent<RefreshTokenResponse>> {
    try {
      const result = await this.authService.refreshToken(language, body);

      return this.actionResponse<RefreshTokenResponse, RefreshTokenRequestBody>(
        result,
      );
    } catch (error) {
      return this.actionResponseError(language, error);
    }
  }

  @Get(API_CONTROLLER_CONFIG.AUTH.ROUTE.GET_ME)
  @ApiDocGetMeDoc()
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(
    @CurrentUser() user: UserAccount,
    @CurrentLanguage() language: Language,
  ): Promise<ResponseContent<UserProfileResponse>> {
    try {
      const result = await this.authService.getUserProfile(
        language,
        user.userId,
      );

      return this.actionResponse<UserProfileResponse, string>(result);
    } catch (error) {
      return this.actionResponseError(language, error);
    }
  }
}
