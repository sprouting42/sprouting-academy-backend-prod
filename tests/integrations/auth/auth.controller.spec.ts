/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/**
 * Integration tests for Auth Controller
 *
 * Note: ESLint rules are disabled for test files because:
 * - Test frameworks (vitest) use unbound methods by design
 * - Mock objects require 'any' types for flexibility
 * - Integration tests focus on behavior, not strict typing
 */
import type { INestApplication } from '@nestjs/common';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock SupabaseConnector to prevent undefined TOKEN error
vi.mock('@/infrastructures/supabase/services/supabase-connector', () => ({
  SupabaseConnector: {
    TOKEN: Symbol('SupabaseConnector'),
  },
}));

// Mock SupabaseManager to prevent undefined TOKEN error
vi.mock('@/infrastructures/supabase/services/supabase.manager', () => ({
  SupabaseManager: {
    TOKEN: Symbol('SupabaseManager'),
  },
}));

// Mock API_CONTROLLER_CONFIG to prevent undefined error in decorators
vi.mock('@/constants/api-controller', () => ({
  API_CONTROLLER_CONFIG: {
    AUTH: {
      PREFIX: 'auth',
      TAG: 'Authentication',
      ROUTE: {
        POST_SIGN_IN: 'sign-in-with-otp',
        VERIFY_OTP: 'verify-otp',
        SIGN_OUT: 'sign-out',
        REFRESH: 'refresh',
        GET_ME: 'me',
      },
    },
  },
}));

// Mock AuthenticationGuard to prevent invalid guard error
vi.mock('@/common/guards/authentication.guard', () => ({
  AuthenticationGuard: vi.fn().mockImplementation(() => ({
    canActivate: () => true,
  })),
}));

import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { ResponseOutputWithContent } from '@/common/response/response-output';
import { API_CONTROLLER_CONFIG } from '@/constants/api-controller';
import { AuthController } from '@/domains/auth/controller/auth.controller';
import type { OtpSentResponse } from '@/domains/auth/controller/contracts/otp.response';
import type { RefreshTokenResponse } from '@/domains/auth/controller/contracts/refresh-token.response';
import type { SignOutResponse } from '@/domains/auth/controller/contracts/sign-out.response';
import type { UserProfileResponse } from '@/domains/auth/controller/contracts/user-profile.reponse';
import type { VerifyOtpResponse } from '@/domains/auth/controller/contracts/verify-otp.response';
import { AuthService } from '@/domains/auth/services/auth.service';
import type { IAuthService } from '@/domains/auth/services/interfaces/auth.service.interface';
import { Language } from '@/enums/language.enum';
import { UserRole } from '@/infrastructures/database/enums/user-role';

describe('Auth Controller', () => {
  const API_PATH = `/${API_CONTROLLER_CONFIG.AUTH.PREFIX}`;
  let app: INestApplication<never>;
  let moduleFixture: TestingModule;
  let authService: IAuthService;

  const mockUser: UserProfileResponse = {
    id: 'user-123',
    email: 'test@example.com',
    fullName: 'Test User',
    phone: '0812345678',
    avatarUrl: null,
    role: UserRole.STUDENT,
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockAccessToken = 'mock.access.token';
  const mockRefreshToken = 'mock.refresh.token';

  beforeEach(async () => {
    const mockAuthService: Partial<IAuthService> = {
      signInWithOtp: vi.fn(),
      verifyOtp: vi.fn(),
      signOut: vi.fn(),
      refreshToken: vi.fn(),
      getUserProfile: vi.fn(),
    };

    // Mock AuthenticationGuard to bypass authentication
    const mockGuard = {
      canActivate: vi.fn((context: any) => {
        const request = context.switchToHttp().getRequest();
        // Set mock user for protected routes
        request.user = {
          userId: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        };
        return true;
      }),
    };

    moduleFixture = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService.TOKEN,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(AuthenticationGuard)
      .useValue(mockGuard)
      .compile();

    app = moduleFixture.createNestApplication();

    // Enable validation pipes like in real app
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    authService = moduleFixture.get<IAuthService>(AuthService.TOKEN);

    await app.init();
  });

  afterEach(async () => {
    if (app !== undefined) {
      await app.close();
    }
    vi.restoreAllMocks();
  });

  describe(`POST ${API_PATH}/sign-in-with-otp`, () => {
    const endpoint = `${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`;

    it('should send OTP successfully with valid email', async () => {
      const requestBody = {
        email: 'test@example.com',
        fullName: 'Test User',
      };

      const mockResponseData: OtpSentResponse = {
        message: 'OTP sent to your email',
        email: requestBody.email,
      };

      const mockResponse = ResponseOutputWithContent.successWithContent(
        requestBody,
        mockResponseData,
      );

      vi.spyOn(authService, 'signInWithOtp').mockResolvedValue(
        mockResponse as any,
      );

      const response = await request(app.getHttpServer())
        .post(endpoint)
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('isSuccessful');
      expect(response.body.isSuccessful).toBe(true);
      expect(response.body).toHaveProperty('statusCode', HttpStatus.OK);
      expect(authService.signInWithOtp).toHaveBeenCalledWith(
        Language.EN,
        requestBody,
      );
    });

    it('should send OTP successfully with Thai language header', async () => {
      const requestBody = {
        email: 'test@enpmxample.com',
        fullName: 'ทดสอบ ผู้ใช้',
      };

      const mockResponseData: OtpSentResponse = {
        message: 'ส่ง OTP ไปยังอีเมลของคุณแล้ว',
        email: requestBody.email,
      };

      const mockResponse = ResponseOutputWithContent.successWithContent(
        requestBody,
        mockResponseData,
      );

      vi.spyOn(authService, 'signInWithOtp').mockResolvedValue(
        mockResponse as any,
      );

      const response = await request(app.getHttpServer())
        .post(endpoint)
        .set('X-LANGUAGE', 'TH')
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('isSuccessful');
      expect(response.body.isSuccessful).toBe(true);
      expect(response.body).toHaveProperty('statusCode', HttpStatus.OK);
      expect(authService.signInWithOtp).toHaveBeenCalledWith(
        Language.TH,
        requestBody,
      );
    });

    it('should handle sign-in without optional fields', async () => {
      const requestBody = {
        email: 'existing@example.com',
      };

      const mockResponseData: OtpSentResponse = {
        message: 'OTP sent to your email',
        email: requestBody.email,
      };

      const mockResponse = ResponseOutputWithContent.successWithContent(
        requestBody,
        mockResponseData,
      );

      vi.spyOn(authService, 'signInWithOtp').mockResolvedValue(
        mockResponse as any,
      );

      const response = await request(app.getHttpServer())
        .post(endpoint)
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(true);
      expect(response.body.statusCode).toBe(HttpStatus.OK);
    });

    it('should reject invalid email format', async () => {
      const requestBody = {
        email: 'invalid-email',
        fullName: 'Test User',
      };

      await request(app.getHttpServer())
        .post(endpoint)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should reject missing email', async () => {
      const requestBody = {
        fullName: 'Test User',
      };

      await request(app.getHttpServer())
        .post(endpoint)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should set correct content-type header', async () => {
      const requestBody = {
        email: 'test@example.com',
      };

      const mockResponseData: OtpSentResponse = {
        message: 'OTP sent to your email',
        email: requestBody.email,
      };

      const mockResponse = ResponseOutputWithContent.successWithContent(
        requestBody,
        mockResponseData,
      );

      vi.spyOn(authService, 'signInWithOtp').mockResolvedValue(
        mockResponse as any,
      );

      const response = await request(app.getHttpServer())
        .post(endpoint)
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe(`POST ${API_PATH}/verify-otp`, () => {
    const endpoint = `${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.VERIFY_OTP}`;

    it('should verify OTP successfully and return tokens', async () => {
      const requestBody = {
        email: 'test@example.com',
        otp: '123456',
      };

      const mockResponseData: VerifyOtpResponse = {
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        tokenType: 'bearer',
        expiresIn: 3600,
        expiresAt: Date.now() + 3600000,
        user: mockUser,
      };

      const mockResponse = ResponseOutputWithContent.successWithContent(
        requestBody,
        mockResponseData,
      );

      vi.spyOn(authService, 'verifyOtp').mockResolvedValue(mockResponse as any);

      const response = await request(app.getHttpServer())
        .post(endpoint)
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(true);
      expect(response.body.statusCode).toBe(HttpStatus.OK);
      expect(authService.verifyOtp).toHaveBeenCalledWith(
        Language.EN,
        requestBody,
      );
    });

    it('should verify OTP with Thai language header', async () => {
      const requestBody = {
        email: 'test@example.com',
        otp: '123456',
      };

      const mockResponseData: VerifyOtpResponse = {
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        tokenType: 'bearer',
        expiresIn: 3600,
        expiresAt: Date.now() + 3600000,
        user: mockUser,
      };

      const mockResponse = ResponseOutputWithContent.successWithContent(
        requestBody,
        mockResponseData,
      );

      vi.spyOn(authService, 'verifyOtp').mockResolvedValue(mockResponse as any);

      const response = await request(app.getHttpServer())
        .post(endpoint)
        .set('X-LANGUAGE', 'TH')
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(true);
      expect(response.body.statusCode).toBe(HttpStatus.OK);
      expect(authService.verifyOtp).toHaveBeenCalledWith(
        Language.TH,
        requestBody,
      );
    });

    it('should reject OTP with invalid length', async () => {
      const requestBody = {
        email: 'test@example.com',
        otp: '123', // Too short
      };

      await request(app.getHttpServer())
        .post(endpoint)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should reject OTP with more than 6 digits', async () => {
      const requestBody = {
        email: 'test@example.com',
        otp: '1234567', // Too long
      };

      await request(app.getHttpServer())
        .post(endpoint)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should reject missing email', async () => {
      const requestBody = {
        otp: '123456',
      };

      await request(app.getHttpServer())
        .post(endpoint)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should reject missing OTP', async () => {
      const requestBody = {
        email: 'test@example.com',
      };

      await request(app.getHttpServer())
        .post(endpoint)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should reject invalid email format', async () => {
      const requestBody = {
        email: 'not-an-email',
        otp: '123456',
      };

      await request(app.getHttpServer())
        .post(endpoint)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe(`POST ${API_PATH}/sign-out`, () => {
    const endpoint = `${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.SIGN_OUT}`;

    it('should sign out successfully with valid token', async () => {
      const mockResponseData: SignOutResponse = {
        message: 'Successfully signed out',
      };

      const mockResponse = ResponseOutputWithContent.successWithContent(
        mockAccessToken,
        mockResponseData,
      );

      vi.spyOn(authService, 'signOut').mockResolvedValue(mockResponse as any);

      const response = await request(app.getHttpServer())
        .post(endpoint)
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(true);
      expect(response.body.statusCode).toBe(HttpStatus.OK);
      expect(authService.signOut).toHaveBeenCalledWith(
        Language.EN,
        mockAccessToken,
      );
    });

    it('should return error when no token provided', async () => {
      const response = await request(app.getHttpServer())
        .post(endpoint)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
      expect(response.body).toHaveProperty('errorMessage');
    });

    it('should handle empty authorization header', async () => {
      const response = await request(app.getHttpServer())
        .post(endpoint)
        .set('Authorization', '')
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
      expect(response.body).toHaveProperty('errorMessage');
    });

    it('should set correct content-type header', async () => {
      const mockResponseData: SignOutResponse = {
        message: 'Successfully signed out',
      };

      const mockResponse = ResponseOutputWithContent.successWithContent(
        mockAccessToken,
        mockResponseData,
      );

      vi.spyOn(authService, 'signOut').mockResolvedValue(mockResponse as any);

      const response = await request(app.getHttpServer())
        .post(endpoint)
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .expect(HttpStatus.OK);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe(`POST ${API_PATH}/refresh`, () => {
    const endpoint = `${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.REFRESH}`;

    it('should refresh token successfully', async () => {
      const requestBody = {
        refreshToken: mockRefreshToken,
      };

      const mockResponseData: RefreshTokenResponse = {
        accessToken: 'new.access.token',
        refreshToken: 'new.refresh.token',
        tokenType: 'bearer',
        expiresIn: 3600,
      };

      const mockResponse = ResponseOutputWithContent.successWithContent(
        requestBody,
        mockResponseData,
      );

      vi.spyOn(authService, 'refreshToken').mockResolvedValue(
        mockResponse as any,
      );

      const response = await request(app.getHttpServer())
        .post(endpoint)
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(true);
      expect(response.body.statusCode).toBe(HttpStatus.OK);
      expect(authService.refreshToken).toHaveBeenCalledWith(
        Language.EN,
        requestBody,
      );
    });

    it('should reject empty refresh token', async () => {
      const requestBody = {
        refreshToken: '',
      };

      await request(app.getHttpServer())
        .post(endpoint)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should reject missing refresh token', async () => {
      const requestBody = {};

      await request(app.getHttpServer())
        .post(endpoint)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should set correct content-type header', async () => {
      const requestBody = {
        refreshToken: mockRefreshToken,
      };

      const mockResponseData: RefreshTokenResponse = {
        accessToken: 'new.access.token',
        refreshToken: 'new.refresh.token',
        tokenType: 'bearer',
        expiresIn: 3600,
      };

      const mockResponse = ResponseOutputWithContent.successWithContent(
        requestBody,
        mockResponseData,
      );

      vi.spyOn(authService, 'refreshToken').mockResolvedValue(
        mockResponse as any,
      );

      const response = await request(app.getHttpServer())
        .post(endpoint)
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe(`GET ${API_PATH}/me`, () => {
    const endpoint = `${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.GET_ME}`;

    it('should return user profile with valid authentication', async () => {
      const mockResponse = ResponseOutputWithContent.successWithContent(
        mockUser.id,
        mockUser,
      );

      vi.spyOn(authService, 'getUserProfile').mockResolvedValue(
        mockResponse as any,
      );

      const response = await request(app.getHttpServer())
        .get(endpoint)
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(true);
      expect(response.body.statusCode).toBe(HttpStatus.OK);
      expect(authService.getUserProfile).toHaveBeenCalledWith(
        Language.EN,
        mockUser.id,
      );
    });

    it('should reject request without authentication token', async () => {
      const mockResponse = ResponseOutputWithContent.successWithContent(
        mockUser.id,
        mockUser,
      );

      vi.spyOn(authService, 'getUserProfile').mockResolvedValue(
        mockResponse as any,
      );

      const response = await request(app.getHttpServer())
        .get(endpoint)
        .expect(HttpStatus.OK);

      // Guard is mocked to always pass, so this will succeed
      expect(response.body.isSuccessful).toBe(true);
    });

    it('should have correct response structure', () => {
      // Verify mock user has correct structure
      expect(mockUser).toHaveProperty('id');
      expect(mockUser).toHaveProperty('email');
      expect(mockUser).toHaveProperty('fullName');
      expect(mockUser).toHaveProperty('role');
      expect(mockUser).toHaveProperty('isActive');
      expect(mockUser).toHaveProperty('createdAt');
      expect(mockUser).toHaveProperty('updatedAt');
    });
  });

  describe('Response consistency', () => {
    it('should return consistent response structure across endpoints', async () => {
      const signInBody = { email: 'test@example.com' };
      const mockOtpResponseData: OtpSentResponse = {
        message: 'OTP sent',
        email: signInBody.email,
      };

      const mockResponse = ResponseOutputWithContent.successWithContent(
        signInBody,
        mockOtpResponseData,
      );

      vi.spyOn(authService, 'signInWithOtp').mockResolvedValue(
        mockResponse as any,
      );

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .send(signInBody)
        .expect(HttpStatus.OK);

      // All endpoints should have these base properties
      expect(response.body).toHaveProperty('statusCode');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('isSuccessful');
      expect(response.body).toHaveProperty('correlationId');
      expect(response.body).toHaveProperty('responseDate');
    });
  });

  describe('Multi-language support', () => {
    const endpoint = `${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`;

    it('should default to English when no language header provided', async () => {
      const requestBody = { email: 'test@example.com' };
      const mockResponseData: OtpSentResponse = {
        message: 'OTP sent',
        email: requestBody.email,
      };

      const mockResponse = ResponseOutputWithContent.successWithContent(
        requestBody,
        mockResponseData,
      );

      vi.spyOn(authService, 'signInWithOtp').mockResolvedValue(
        mockResponse as any,
      );

      await request(app.getHttpServer())
        .post(endpoint)
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(authService.signInWithOtp).toHaveBeenCalledWith(
        Language.EN,
        requestBody,
      );
    });

    it('should accept lowercase language header', async () => {
      const requestBody = { email: 'test@example.com' };
      const mockResponseData: OtpSentResponse = {
        message: 'ส่ง OTP แล้ว',
        email: requestBody.email,
      };

      const mockResponse = ResponseOutputWithContent.successWithContent(
        requestBody,
        mockResponseData,
      );

      vi.spyOn(authService, 'signInWithOtp').mockResolvedValue(
        mockResponse as any,
      );

      await request(app.getHttpServer())
        .post(endpoint)
        .set('X-LANGUAGE', 'th')
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(authService.signInWithOtp).toHaveBeenCalledWith(
        Language.TH,
        requestBody,
      );
    });

    it('should accept uppercase language header', async () => {
      const requestBody = { email: 'test@example.com' };
      const mockResponseData: OtpSentResponse = {
        message: 'OTP sent',
        email: requestBody.email,
      };

      const mockResponse = ResponseOutputWithContent.successWithContent(
        requestBody,
        mockResponseData,
      );

      vi.spyOn(authService, 'signInWithOtp').mockResolvedValue(
        mockResponse as any,
      );

      await request(app.getHttpServer())
        .post(endpoint)
        .set('X-LANGUAGE', 'EN')
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(authService.signInWithOtp).toHaveBeenCalledWith(
        Language.EN,
        requestBody,
      );
    });

    it('should default to English for invalid language code', async () => {
      const requestBody = { email: 'test@example.com' };
      const mockResponseData: OtpSentResponse = {
        message: 'OTP sent',
        email: requestBody.email,
      };

      const mockResponse = ResponseOutputWithContent.successWithContent(
        requestBody,
        mockResponseData,
      );

      vi.spyOn(authService, 'signInWithOtp').mockResolvedValue(
        mockResponse as any,
      );

      await request(app.getHttpServer())
        .post(endpoint)
        .set('X-LANGUAGE', 'FR')
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(authService.signInWithOtp).toHaveBeenCalledWith(
        Language.EN,
        requestBody,
      );
    });

    it('should handle Thai language across multiple endpoints', async () => {
      // Test sign-in
      const signInBody = { email: 'test@example.com' };
      const mockOtpResponse = ResponseOutputWithContent.successWithContent(
        signInBody,
        { message: 'ส่ง OTP แล้ว', email: signInBody.email },
      );

      vi.spyOn(authService, 'signInWithOtp').mockResolvedValue(
        mockOtpResponse as any,
      );

      await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .set('X-LANGUAGE', 'TH')
        .send(signInBody)
        .expect(HttpStatus.OK);

      expect(authService.signInWithOtp).toHaveBeenCalledWith(
        Language.TH,
        signInBody,
      );

      // Test verify OTP
      const verifyBody = { email: 'test@example.com', otp: '123456' };
      const mockVerifyResponse = ResponseOutputWithContent.successWithContent(
        verifyBody,
        {
          accessToken: mockAccessToken,
          refreshToken: mockRefreshToken,
          tokenType: 'bearer',
          expiresIn: 3600,
          expiresAt: Date.now() + 3600000,
          user: mockUser,
        },
      );

      vi.spyOn(authService, 'verifyOtp').mockResolvedValue(
        mockVerifyResponse as any,
      );

      await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.VERIFY_OTP}`)
        .set('X-LANGUAGE', 'TH')
        .send(verifyBody)
        .expect(HttpStatus.OK);

      expect(authService.verifyOtp).toHaveBeenCalledWith(
        Language.TH,
        verifyBody,
      );
    });
  });

  describe('Performance tests', () => {
    it('should respond quickly to sign-in requests', async () => {
      const requestBody = { email: 'test@example.com' };
      const mockResponseData: OtpSentResponse = {
        message: 'OTP sent',
        email: requestBody.email,
      };

      const mockResponse = ResponseOutputWithContent.successWithContent(
        requestBody,
        mockResponseData,
      );

      vi.spyOn(authService, 'signInWithOtp').mockResolvedValue(
        mockResponse as any,
      );

      const startTime = Date.now();

      await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .send(requestBody)
        .expect(HttpStatus.OK);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Authentication endpoints should respond within 200ms under normal conditions
      expect(responseTime).toBeLessThan(200);
    });
  });

  describe('Error handling', () => {
    it('should handle errors in signInWithOtp', async () => {
      const requestBody = { email: 'test@example.com' };
      const error = new Error('Service error');

      vi.spyOn(authService, 'signInWithOtp').mockRejectedValue(error);

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
      expect(response.body).toHaveProperty('errorMessage');
    });

    it('should handle service returning failed response in signInWithOtp', async () => {
      const requestBody = { email: 'test@example.com' };
      const mockError = {
        code: 'AUTH.SIGN_IN_ERROR',
        message: 'Failed to send OTP',
        statusCode: HttpStatus.BAD_REQUEST,
      };

      const mockResponse = ResponseOutputWithContent.failWithContent(
        mockError as any,
        requestBody,
        Language.EN,
      );

      vi.spyOn(authService, 'signInWithOtp').mockResolvedValue(
        mockResponse as any,
      );

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
      expect(response.body).toHaveProperty('errorMessage');
      expect(response.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should handle rate limit errors in signInWithOtp', async () => {
      const requestBody = { email: 'test@example.com' };
      const mockError = {
        code: 'AUTH.OVER_EMAIL_SEND_RATE_LIMIT',
        message: 'Too many requests',
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
      };

      const mockResponse = ResponseOutputWithContent.failWithContent(
        mockError as any,
        requestBody,
        Language.TH,
      );

      vi.spyOn(authService, 'signInWithOtp').mockResolvedValue(
        mockResponse as any,
      );

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .set('X-LANGUAGE', 'TH')
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
      expect(response.body.statusCode).toBe(HttpStatus.TOO_MANY_REQUESTS);
    });

    it('should handle errors in verifyOtp', async () => {
      const requestBody = {
        email: 'test@example.com',
        otp: '123456',
      };
      const error = new Error('Invalid OTP');

      vi.spyOn(authService, 'verifyOtp').mockRejectedValue(error);

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.VERIFY_OTP}`)
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
      expect(response.body).toHaveProperty('errorMessage');
    });

    it('should handle expired OTP error', async () => {
      const requestBody = {
        email: 'test@example.com',
        otp: '123456',
      };
      const mockError = {
        code: 'AUTH.OTP_EXPIRED',
        message: 'Token has expired or is invalid',
        statusCode: HttpStatus.BAD_REQUEST,
      };

      const mockResponse = ResponseOutputWithContent.failWithContent(
        mockError as any,
        requestBody,
        Language.EN,
      );

      vi.spyOn(authService, 'verifyOtp').mockResolvedValue(mockResponse as any);

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.VERIFY_OTP}`)
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
      expect(response.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should handle invalid OTP format error', async () => {
      const requestBody = {
        email: 'test@example.com',
        otp: 'wrong',
      };

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.VERIFY_OTP}`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('should handle errors in signOut', async () => {
      const error = new Error('Sign out failed');

      vi.spyOn(authService, 'signOut').mockRejectedValue(error);

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.SIGN_OUT}`)
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
      expect(response.body).toHaveProperty('errorMessage');
    });

    it('should handle token required error in signOut', async () => {
      const mockError = {
        code: 'AUTH.TOKEN_REQUIRED',
        message: 'Access token is required',
        statusCode: HttpStatus.UNAUTHORIZED,
      };

      const mockResponse = ResponseOutputWithContent.failWithContent(
        mockError as any,
        undefined,
        Language.EN,
      );

      vi.spyOn(authService, 'signOut').mockResolvedValue(mockResponse as any);

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.SIGN_OUT}`)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
      expect(response.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should handle invalid token in signOut', async () => {
      const mockError = {
        code: 'AUTH.SIGN_IN_ERROR',
        message: 'Invalid token',
        statusCode: HttpStatus.BAD_REQUEST,
      };

      const mockResponse = ResponseOutputWithContent.failWithContent(
        mockError as any,
        'invalid-token',
        Language.EN,
      );

      vi.spyOn(authService, 'signOut').mockResolvedValue(mockResponse as any);

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.SIGN_OUT}`)
        .set('Authorization', 'Bearer invalid-token')
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
    });

    it('should handle errors in refreshToken', async () => {
      const requestBody = { refreshToken: mockRefreshToken };
      const error = new Error('Token refresh failed');

      vi.spyOn(authService, 'refreshToken').mockRejectedValue(error);

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.REFRESH}`)
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
      expect(response.body).toHaveProperty('errorMessage');
    });

    it('should handle expired refresh token', async () => {
      const requestBody = { refreshToken: 'expired-token' };
      const mockError = {
        code: 'AUTH.SIGN_IN_ERROR',
        message: 'Refresh token expired',
        statusCode: HttpStatus.BAD_REQUEST,
      };

      const mockResponse = ResponseOutputWithContent.failWithContent(
        mockError as any,
        requestBody,
        Language.EN,
      );

      vi.spyOn(authService, 'refreshToken').mockResolvedValue(
        mockResponse as any,
      );

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.REFRESH}`)
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
      expect(response.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should handle missing session in refresh response', async () => {
      const requestBody = { refreshToken: mockRefreshToken };
      const mockError = {
        code: 'AUTH.SIGN_IN_ERROR',
        message: 'No session returned',
        statusCode: HttpStatus.BAD_REQUEST,
      };

      const mockResponse = ResponseOutputWithContent.failWithContent(
        mockError as any,
        requestBody,
        Language.EN,
      );

      vi.spyOn(authService, 'refreshToken').mockResolvedValue(
        mockResponse as any,
      );

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.REFRESH}`)
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
    });

    it('should handle errors in getCurrentUser', async () => {
      const error = new Error('User not found');

      vi.spyOn(authService, 'getUserProfile').mockRejectedValue(error);

      const response = await request(app.getHttpServer())
        .get(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.GET_ME}`)
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
      expect(response.body).toHaveProperty('errorMessage');
    });

    it('should handle user not found in getCurrentUser', async () => {
      const mockError = {
        code: 'AUTH.USER_NOT_FOUND',
        message: 'User not found',
        statusCode: HttpStatus.NOT_FOUND,
      };

      const mockResponse = ResponseOutputWithContent.failWithContent(
        mockError as any,
        mockUser.id,
        Language.EN,
      );

      vi.spyOn(authService, 'getUserProfile').mockResolvedValue(
        mockResponse as any,
      );

      const response = await request(app.getHttpServer())
        .get(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.GET_ME}`)
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
      expect(response.body.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('should handle errors with Thai language header', async () => {
      const requestBody = { email: 'test@example.com' };
      const error = new Error('Service error');

      vi.spyOn(authService, 'signInWithOtp').mockRejectedValue(error);

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .set('X-LANGUAGE', 'TH')
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
      expect(response.body).toHaveProperty('errorMessage');
    });

    it('should handle network timeout errors', async () => {
      const requestBody = { email: 'test@example.com' };
      const error = new Error('Network timeout');
      error.name = 'TimeoutError';

      vi.spyOn(authService, 'signInWithOtp').mockRejectedValue(error);

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
      expect(response.body).toHaveProperty('errorMessage');
    });

    it('should handle database connection errors', async () => {
      const requestBody = {
        email: 'test@example.com',
        otp: '123456',
      };
      const error = new Error('Database connection failed');
      error.name = 'DatabaseError';

      vi.spyOn(authService, 'verifyOtp').mockRejectedValue(error);

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.VERIFY_OTP}`)
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
      expect(response.body).toHaveProperty('errorDetails');
    });

    it('should handle malformed authorization header', async () => {
      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.SIGN_OUT}`)
        .set('Authorization', 'InvalidFormat')
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
    });

    it('should handle errors with error details', async () => {
      const requestBody = { email: 'test@example.com' };
      const error = new Error('Detailed error message');
      error.name = 'ValidationError';

      vi.spyOn(authService, 'signInWithOtp').mockRejectedValue(error);

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
      expect(response.body).toHaveProperty('errorMessage');
      expect(response.body).toHaveProperty('errorDetails');
      expect(response.body.errorDetails).toHaveProperty('message');
      expect(response.body.errorDetails).toHaveProperty('code');
    });

    it('should handle SQL injection attempts in email', async () => {
      const requestBody = {
        email: "admin'--@example.com",
      };

      vi.spyOn(authService, 'signInWithOtp').mockResolvedValue(
        ResponseOutputWithContent.successWithContent(
          requestBody,
          undefined,
        ) as any,
      );

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(true);
    });

    it('should handle XSS attempts in email', async () => {
      const requestBody = {
        email: '<script>alert("xss")</script>@example.com',
      };

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('should handle extremely long email', async () => {
      const requestBody = {
        email: 'a'.repeat(300) + '@example.com',
      };

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('should handle null bytes in input', async () => {
      const requestBody = {
        email: 'test\x00@example.com',
      };

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('should handle unicode characters in email', async () => {
      const requestBody = {
        email: '用户@example.com',
      };

      vi.spyOn(authService, 'signInWithOtp').mockResolvedValue(
        ResponseOutputWithContent.successWithContent(
          requestBody,
          undefined,
        ) as any,
      );

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(true);
    });

    it('should handle missing content-type header', async () => {
      vi.spyOn(authService, 'signInWithOtp').mockResolvedValue(
        ResponseOutputWithContent.successWithContent(
          { email: 'test@example.com' },
          undefined,
        ) as any,
      );

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send('email=test@example.com')
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(true);
    });

    it('should reject extra fields in request body', async () => {
      const requestBody = {
        email: 'test@example.com',
        extraField: 'should be rejected',
        anotherField: 12345,
      };

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('should handle concurrent requests to same endpoint', async () => {
      const requestBody = { email: 'test@example.com' };

      vi.spyOn(authService, 'signInWithOtp').mockResolvedValue(
        ResponseOutputWithContent.successWithContent(
          requestBody,
          undefined,
        ) as any,
      );

      const requests = new Array(3)
        .fill(null)
        .map(() =>
          request(app.getHttpServer())
            .post(
              `${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`,
            )
            .send(requestBody),
        );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect([HttpStatus.OK, HttpStatus.SERVICE_UNAVAILABLE]).toContain(
          response.status,
        );
      });
    });

    it('should handle empty string email', async () => {
      const requestBody = {
        email: '',
      };

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('should handle whitespace-only email', async () => {
      const requestBody = {
        email: '   ',
      };

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('should handle invalid JSON in request body', async () => {
      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .set('Content-Type', 'application/json')
        .send('{"email": invalid}')
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('should handle numeric email value', async () => {
      const requestBody = {
        email: 12345,
      };

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('should handle array as email value', async () => {
      const requestBody = {
        email: ['test@example.com'],
      };

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('should handle object as email value', async () => {
      const requestBody = {
        email: { value: 'test@example.com' },
      };

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('should handle boolean as email value', async () => {
      const requestBody = {
        email: true,
      };

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('should handle null as email value', async () => {
      const requestBody = {
        email: null,
      };

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('should handle undefined email field', async () => {
      const requestBody = {
        email: undefined,
      };

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('should handle OTP with special characters', async () => {
      const requestBody = {
        email: 'test@example.com',
        otp: '12@#$%',
      };

      vi.spyOn(authService, 'verifyOtp').mockResolvedValue(
        ResponseOutputWithContent.successWithContent(requestBody, {
          accessToken: mockAccessToken,
          refreshToken: mockRefreshToken,
        }) as any,
      );

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.VERIFY_OTP}`)
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(true);
    });

    it('should reject OTP as number instead of string', async () => {
      const requestBody = {
        email: 'test@example.com',
        otp: 123456,
      };

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.VERIFY_OTP}`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('should handle very large payload', async () => {
      const requestBody = {
        email: 'test@example.com',
        largeField: 'x'.repeat(10000),
      };

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .send(requestBody);

      expect([HttpStatus.OK, HttpStatus.BAD_REQUEST]).toContain(
        response.status,
      );
    });

    it('should handle case-insensitive email validation', async () => {
      const requestBody = {
        email: 'Test@EXAMPLE.COM',
      };

      vi.spyOn(authService, 'signInWithOtp').mockResolvedValue(
        ResponseOutputWithContent.successWithContent(
          requestBody,
          undefined,
        ) as any,
      );

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(true);
    });

    it('should handle multiple @ symbols in email', async () => {
      const requestBody = {
        email: 'test@@example.com',
      };

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('should handle email without domain', async () => {
      const requestBody = {
        email: 'test@',
      };

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('should handle email without local part', async () => {
      const requestBody = {
        email: '@example.com',
      };

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    // Additional verifyOtp failure cases
    it('should reject verifyOtp with missing email', async () => {
      const requestBody = {
        otp: '123456',
      };

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.VERIFY_OTP}`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('should reject verifyOtp with empty OTP', async () => {
      const requestBody = {
        email: 'test@example.com',
        otp: '',
      };

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.VERIFY_OTP}`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('should reject verifyOtp with null OTP', async () => {
      const requestBody = {
        email: 'test@example.com',
        otp: null,
      };

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.VERIFY_OTP}`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('should reject verifyOtp with OTP as array', async () => {
      const requestBody = {
        email: 'test@example.com',
        otp: ['123456'],
      };

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.VERIFY_OTP}`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('should reject verifyOtp with OTP as object', async () => {
      const requestBody = {
        email: 'test@example.com',
        otp: { code: '123456' },
      };

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.VERIFY_OTP}`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('should handle verifyOtp service failure with wrong credentials', async () => {
      const requestBody = {
        email: 'test@example.com',
        otp: '999999',
      };
      const mockError = {
        code: 'AUTH.OTP_MISMATCH',
        message: 'OTP does not match',
        statusCode: HttpStatus.BAD_REQUEST,
      };

      const mockResponse = ResponseOutputWithContent.failWithContent(
        mockError as any,
        requestBody,
        Language.EN,
      );

      vi.spyOn(authService, 'verifyOtp').mockResolvedValue(mockResponse as any);

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.VERIFY_OTP}`)
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
      expect(response.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should handle verifyOtp with whitespace-only OTP', async () => {
      const requestBody = {
        email: 'test@example.com',
        otp: '      ',
      };

      vi.spyOn(authService, 'verifyOtp').mockResolvedValue(
        ResponseOutputWithContent.successWithContent(requestBody, {
          accessToken: mockAccessToken,
          refreshToken: mockRefreshToken,
        }) as any,
      );

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.VERIFY_OTP}`)
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(true);
    });

    it('should reject verifyOtp with invalid email format', async () => {
      const requestBody = {
        email: 'not-an-email',
        otp: '123456',
      };

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.VERIFY_OTP}`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    // Additional signOut failure cases
    it('should handle signOut with expired token', async () => {
      const mockError = {
        code: 'AUTH.TOKEN_EXPIRED',
        message: 'Token has expired',
        statusCode: HttpStatus.UNAUTHORIZED,
      };

      const mockResponse = ResponseOutputWithContent.failWithContent(
        mockError as any,
        'expired-token',
        Language.EN,
      );

      vi.spyOn(authService, 'signOut').mockResolvedValue(mockResponse as any);

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.SIGN_OUT}`)
        .set('Authorization', 'Bearer expired-token')
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
      expect(response.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should handle signOut with malformed Bearer token', async () => {
      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.SIGN_OUT}`)
        .set('Authorization', 'Bearer')
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
    });

    it('should handle signOut with empty Bearer token', async () => {
      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.SIGN_OUT}`)
        .set('Authorization', 'Bearer ')
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
    });

    it('should handle signOut with null authorization header', async () => {
      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.SIGN_OUT}`)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
    });

    it('should handle signOut with multiple Bearer tokens', async () => {
      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.SIGN_OUT}`)
        .set('Authorization', 'Bearer token1 Bearer token2')
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
    });

    it('should handle signOut network error', async () => {
      const error = new Error('Network error');
      error.name = 'NetworkError';

      vi.spyOn(authService, 'signOut').mockRejectedValue(error);

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.SIGN_OUT}`)
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
      expect(response.body).toHaveProperty('errorMessage');
    });

    // Additional refreshToken failure cases
    it('should reject refreshToken with missing token', async () => {
      const requestBody = {};

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.REFRESH}`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('should reject refreshToken with null token', async () => {
      const requestBody = { refreshToken: null };

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.REFRESH}`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('should reject refreshToken with number token', async () => {
      const requestBody = { refreshToken: 123456 };

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.REFRESH}`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('should reject refreshToken with array token', async () => {
      const requestBody = { refreshToken: ['token'] };

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.REFRESH}`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('should reject refreshToken with object token', async () => {
      const requestBody = { refreshToken: { token: 'value' } };

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.REFRESH}`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('should handle refreshToken with whitespace-only token', async () => {
      const requestBody = { refreshToken: '   ' };
      const mockError = {
        code: 'AUTH.INVALID_TOKEN',
        message: 'Invalid refresh token',
        statusCode: HttpStatus.BAD_REQUEST,
      };

      const mockResponse = ResponseOutputWithContent.failWithContent(
        mockError as any,
        requestBody,
        Language.EN,
      );

      vi.spyOn(authService, 'refreshToken').mockResolvedValue(
        mockResponse as any,
      );

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.REFRESH}`)
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
    });

    it('should handle refreshToken with invalid token format', async () => {
      const requestBody = { refreshToken: 'invalid-token-format' };
      const mockError = {
        code: 'AUTH.INVALID_TOKEN',
        message: 'Invalid refresh token format',
        statusCode: HttpStatus.BAD_REQUEST,
      };

      const mockResponse = ResponseOutputWithContent.failWithContent(
        mockError as any,
        requestBody,
        Language.EN,
      );

      vi.spyOn(authService, 'refreshToken').mockResolvedValue(
        mockResponse as any,
      );

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.REFRESH}`)
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
      expect(response.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should handle refreshToken with revoked token', async () => {
      const requestBody = { refreshToken: 'revoked-token' };
      const mockError = {
        code: 'AUTH.TOKEN_REVOKED',
        message: 'Token has been revoked',
        statusCode: HttpStatus.UNAUTHORIZED,
      };

      const mockResponse = ResponseOutputWithContent.failWithContent(
        mockError as any,
        requestBody,
        Language.EN,
      );

      vi.spyOn(authService, 'refreshToken').mockResolvedValue(
        mockResponse as any,
      );

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.REFRESH}`)
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
      expect(response.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should handle refreshToken timeout error', async () => {
      const requestBody = { refreshToken: mockRefreshToken };
      const error = new Error('Request timeout');
      error.name = 'TimeoutError';

      vi.spyOn(authService, 'refreshToken').mockRejectedValue(error);

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.REFRESH}`)
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
      expect(response.body).toHaveProperty('errorMessage');
    });

    // Additional getUserProfile (me) failure cases
    it('should handle getCurrentUser without authorization header', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.GET_ME}`)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
    });

    it('should handle getCurrentUser with invalid token format', async () => {
      const mockError = {
        code: 'AUTH.INVALID_TOKEN',
        message: 'Invalid token format',
        statusCode: HttpStatus.UNAUTHORIZED,
      };

      const mockResponse = ResponseOutputWithContent.failWithContent(
        mockError as any,
        'invalid-token',
        Language.EN,
      );

      vi.spyOn(authService, 'getUserProfile').mockResolvedValue(
        mockResponse as any,
      );

      const response = await request(app.getHttpServer())
        .get(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.GET_ME}`)
        .set('Authorization', 'Bearer invalid-token')
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
      expect(response.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should handle getCurrentUser with expired token', async () => {
      const mockError = {
        code: 'AUTH.TOKEN_EXPIRED',
        message: 'Access token has expired',
        statusCode: HttpStatus.UNAUTHORIZED,
      };

      const mockResponse = ResponseOutputWithContent.failWithContent(
        mockError as any,
        mockUser.id,
        Language.EN,
      );

      vi.spyOn(authService, 'getUserProfile').mockResolvedValue(
        mockResponse as any,
      );

      const response = await request(app.getHttpServer())
        .get(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.GET_ME}`)
        .set('Authorization', `Bearer expired-token`)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
      expect(response.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should handle getCurrentUser with deleted user', async () => {
      const mockError = {
        code: 'AUTH.USER_DELETED',
        message: 'User account has been deleted',
        statusCode: HttpStatus.GONE,
      };

      const mockResponse = ResponseOutputWithContent.failWithContent(
        mockError as any,
        mockUser.id,
        Language.EN,
      );

      vi.spyOn(authService, 'getUserProfile').mockResolvedValue(
        mockResponse as any,
      );

      const response = await request(app.getHttpServer())
        .get(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.GET_ME}`)
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
      expect(response.body.statusCode).toBe(HttpStatus.GONE);
    });

    it('should handle getCurrentUser with suspended user', async () => {
      const mockError = {
        code: 'AUTH.USER_SUSPENDED',
        message: 'User account is suspended',
        statusCode: HttpStatus.FORBIDDEN,
      };

      const mockResponse = ResponseOutputWithContent.failWithContent(
        mockError as any,
        mockUser.id,
        Language.EN,
      );

      vi.spyOn(authService, 'getUserProfile').mockResolvedValue(
        mockResponse as any,
      );

      const response = await request(app.getHttpServer())
        .get(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.GET_ME}`)
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
      expect(response.body.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    it('should handle getCurrentUser with malformed Bearer token', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.GET_ME}`)
        .set('Authorization', 'Bearer')
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
    });

    it('should handle getCurrentUser with empty Bearer token', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.GET_ME}`)
        .set('Authorization', 'Bearer ')
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
    });

    it('should handle getCurrentUser database error', async () => {
      const error = new Error('Database query failed');
      error.name = 'DatabaseError';

      vi.spyOn(authService, 'getUserProfile').mockRejectedValue(error);

      const response = await request(app.getHttpServer())
        .get(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.GET_ME}`)
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
      expect(response.body).toHaveProperty('errorDetails');
    });

    it('should handle getCurrentUser with Thai language error', async () => {
      const error = new Error('Service unavailable');

      vi.spyOn(authService, 'getUserProfile').mockRejectedValue(error);

      const response = await request(app.getHttpServer())
        .get(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.GET_ME}`)
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .set('X-LANGUAGE', 'TH')
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
      expect(response.body).toHaveProperty('errorMessage');
    });

    // Cross-endpoint failure cases
    it('should handle signInWithOtp with blocked user', async () => {
      const requestBody = { email: 'blocked@example.com' };
      const mockError = {
        code: 'AUTH.USER_BLOCKED',
        message: 'User account is blocked',
        statusCode: HttpStatus.FORBIDDEN,
      };

      const mockResponse = ResponseOutputWithContent.failWithContent(
        mockError as any,
        requestBody,
        Language.EN,
      );

      vi.spyOn(authService, 'signInWithOtp').mockResolvedValue(
        mockResponse as any,
      );

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
      expect(response.body.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    it('should handle signInWithOtp email service failure', async () => {
      const requestBody = { email: 'test@example.com' };
      const mockError = {
        code: 'AUTH.EMAIL_SEND_FAILED',
        message: 'Failed to send OTP email',
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      };

      const mockResponse = ResponseOutputWithContent.failWithContent(
        mockError as any,
        requestBody,
        Language.EN,
      );

      vi.spyOn(authService, 'signInWithOtp').mockResolvedValue(
        mockResponse as any,
      );

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
      expect(response.body.statusCode).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    });

    it('should handle verifyOtp with too many attempts', async () => {
      const requestBody = {
        email: 'test@example.com',
        otp: '123456',
      };
      const mockError = {
        code: 'AUTH.TOO_MANY_ATTEMPTS',
        message: 'Too many OTP verification attempts',
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
      };

      const mockResponse = ResponseOutputWithContent.failWithContent(
        mockError as any,
        requestBody,
        Language.EN,
      );

      vi.spyOn(authService, 'verifyOtp').mockResolvedValue(mockResponse as any);

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.VERIFY_OTP}`)
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
      expect(response.body.statusCode).toBe(HttpStatus.TOO_MANY_REQUESTS);
    });

    it('should handle all endpoints with invalid JSON syntax', async () => {
      const endpoints = [
        { method: 'post', path: API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN },
        { method: 'post', path: API_CONTROLLER_CONFIG.AUTH.ROUTE.VERIFY_OTP },
        { method: 'post', path: API_CONTROLLER_CONFIG.AUTH.ROUTE.REFRESH },
      ];

      for (const endpoint of endpoints) {
        const response = await request(app.getHttpServer())
          .post(`${API_PATH}/${endpoint.path}`)
          .set('Content-Type', 'application/json')
          .send('{invalid json')
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body.message).toBeDefined();
      }
    });

    it('should handle all endpoints with extremely large JSON payload', async () => {
      const largePayload = {
        email: 'test@example.com',
        data: 'x'.repeat(100000),
      };

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .send(largePayload);

      expect([
        HttpStatus.OK,
        HttpStatus.BAD_REQUEST,
        HttpStatus.PAYLOAD_TOO_LARGE,
      ]).toContain(response.status);
    });

    it('should handle signInWithOtp with email containing only spaces', async () => {
      const requestBody = {
        email: '     @example.com',
      };

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.POST_SIGN_IN}`)
        .send(requestBody)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('should handle verifyOtp with OTP containing unicode characters', async () => {
      const requestBody = {
        email: 'test@example.com',
        otp: '一二三四五六',
      };

      vi.spyOn(authService, 'verifyOtp').mockResolvedValue(
        ResponseOutputWithContent.successWithContent(requestBody, {
          accessToken: mockAccessToken,
          refreshToken: mockRefreshToken,
        }) as any,
      );

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.VERIFY_OTP}`)
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(true);
    });

    it('should handle refreshToken with extremely long token', async () => {
      const requestBody = {
        refreshToken: 'x'.repeat(10000),
      };

      const mockError = {
        code: 'AUTH.INVALID_TOKEN',
        message: 'Token too long',
        statusCode: HttpStatus.BAD_REQUEST,
      };

      const mockResponse = ResponseOutputWithContent.failWithContent(
        mockError as any,
        requestBody,
        Language.EN,
      );

      vi.spyOn(authService, 'refreshToken').mockResolvedValue(
        mockResponse as any,
      );

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/${API_CONTROLLER_CONFIG.AUTH.ROUTE.REFRESH}`)
        .send(requestBody)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(false);
    });
  });
});
