/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/**
 * Integration tests for Payment Controller
 */
import type { INestApplication } from '@nestjs/common';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { ResponseOutputWithContent } from '@/common/response/response-output';
import { API_CONTROLLER_CONFIG } from '@/constants/api-controller';
import { PaymentController } from '@/domains/payment/controller/payment.controller';
import type { IPaymentService } from '@/domains/payment/services/interfaces/payment.service.interface';
import { PaymentService } from '@/domains/payment/services/payment.service';
import { PaymentStatus } from '@/enums/payment-status.enum';
import { UserRole } from '@/infrastructures/database/enums/user-role';

// Mock API_CONTROLLER_CONFIG to prevent undefined error in decorators
vi.mock('@/constants/api-controller', () => ({
  API_CONTROLLER_CONFIG: {
    PAYMENT: {
      PREFIX: 'payment',
      TAG: 'Payment',
      ROUTE: {
        BANK_TRANSFER: 'bank-transfer',
        BANK_TRANSFER_BY_ID: ':id',
        BANK_TRANSFER_BY_ENROLLMENT: 'enrollment-course/:enrollmentCourseId',
        BANK_TRANSFER_BY_STATUS: 'status/:status',
      },
    },
  },
}));

// Mock PaymentService
vi.mock('@/domains/payment/services/payment.service', () => ({
  PaymentService: {
    TOKEN: Symbol('PaymentService'),
  },
}));

// Mock SupabaseManager to prevent TOKEN undefined error
vi.mock('@/infrastructures/supabase/supabase.manager', () => ({
  SupabaseManager: {
    TOKEN: Symbol('SupabaseManager'),
  },
}));

// Mock AuthenticationGuard to prevent invalid guard error and SupabaseManager dependency issues
vi.mock('@/common/guards/authentication.guard', () => ({
  AuthenticationGuard: vi.fn().mockImplementation(() => ({
    canActivate: () => true,
  })),
}));

describe('Payment Controller Integration', () => {
  const API_PATH = `/${API_CONTROLLER_CONFIG.PAYMENT.PREFIX}`;
  let app: INestApplication<never>;
  let moduleFixture: TestingModule;
  let paymentService: IPaymentService;

  const mockUser = {
    userId: 'user-123',
    email: 'test@example.com',
    role: UserRole.STUDENT,
  };

  beforeEach(async () => {
    const mockPaymentService: Partial<IPaymentService> = {
      createCharge: vi.fn().mockResolvedValue(
        ResponseOutputWithContent.successWithContent(
          {},
          {
            id: 'chrg_123',
            amount: 100000,
            currency: 'THB',
            status: PaymentStatus.SUCCESSFUL,
          },
        ),
      ),
      retrieveCharge: vi.fn().mockResolvedValue(
        ResponseOutputWithContent.successWithContent(
          {},
          {
            id: 'chrg_123',
            amount: 100000,
            status: PaymentStatus.SUCCESSFUL,
          },
        ),
      ),
      createBankTransferPayment: vi.fn().mockResolvedValue(
        ResponseOutputWithContent.successWithContent(
          {},
          {
            id: 'payment-123',
            slipUrl: 'https://example.com/slip.jpg',
            status: PaymentStatus.PENDING,
          },
        ),
      ),
      approveBankTransferPayment: vi.fn().mockResolvedValue(
        ResponseOutputWithContent.successWithContent(
          {},
          {
            paymentId: 'payment-123',
            status: PaymentStatus.SUCCESSFUL,
            orderId: 'order-123',
            approved: true,
          },
        ),
      ),
      getPayments: vi
        .fn()
        .mockResolvedValue([{ id: 'payment-1', type: 'Bank Transfer' }]),
      getMyPayments: vi
        .fn()
        .mockResolvedValue([{ id: 'payment-1', userId: 'user-123' }]),
    };

    const mockGuard = {
      canActivate: vi.fn((context: any) => {
        const request = context.switchToHttp().getRequest();
        request.user = mockUser;
        return true;
      }),
    };

    moduleFixture = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: PaymentService.TOKEN,
          useValue: mockPaymentService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    })
      .overrideGuard(AuthenticationGuard)
      .useValue(mockGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockGuard)
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    paymentService = moduleFixture.get<IPaymentService>(PaymentService.TOKEN);
  });

  afterEach(async () => {
    await app.close();
  });

  describe(`POST ${API_PATH}/charge`, () => {
    it('should create charge successfully', async () => {
      const mockResponse = ResponseOutputWithContent.successWithContent(
        {},
        {
          id: 'chrg_123',
          amount: 100000,
          currency: 'THB',
          status: PaymentStatus.SUCCESSFUL,
        },
      );

      vi.spyOn(paymentService, 'createCharge').mockResolvedValue(
        mockResponse as never,
      );

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/charge`)
        .send({
          orderId: '550e8400-e29b-41d4-a716-446655440000',
          cardNumber: '4242424242424242',
          cardName: 'John Doe',
          expirationMonth: 12,
          expirationYear: 2025,
          securityCode: '123',
          city: 'Bangkok',
          postalCode: '10110',
        })
        .expect(HttpStatus.CREATED);

      expect(response.body.isSuccessful).toBe(true);
      expect(paymentService.createCharge).toHaveBeenCalled();
    });

    it('should fail with invalid card number', async () => {
      await request(app.getHttpServer())
        .post(`${API_PATH}/charge`)
        .send({
          orderId: '550e8400-e29b-41d4-a716-446655440000',
          cardNumber: '123', // Too short
          cardName: 'John Doe',
          expirationMonth: 12,
          expirationYear: 2025,
          securityCode: '123',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe(`GET ${API_PATH}/charge/:chargeId`, () => {
    it('should retrieve charge successfully', async () => {
      const mockResponse = ResponseOutputWithContent.successWithContent(
        {},
        {
          id: 'chrg_123',
          amount: 100000,
          status: PaymentStatus.SUCCESSFUL,
        },
      );

      vi.spyOn(paymentService, 'retrieveCharge').mockResolvedValue(
        mockResponse as never,
      );

      const response = await request(app.getHttpServer())
        .get(`${API_PATH}/charge/chrg_123`)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(true);
    });
  });

  describe(`POST ${API_PATH}/bank-transfer`, () => {
    it('should create bank transfer payment successfully', async () => {
      const mockResponse = ResponseOutputWithContent.successWithContent(
        {},
        {
          id: 'payment-123',
          slipUrl: 'https://example.com/slip.jpg',
          status: PaymentStatus.PENDING,
        },
      );

      vi.spyOn(paymentService, 'createBankTransferPayment').mockResolvedValue(
        mockResponse as never,
      );

      const response = await request(app.getHttpServer())
        .post(`${API_PATH}/bank-transfer`)
        .field('orderId', '550e8400-e29b-41d4-a716-446655440000')
        .attach('file', Buffer.from('fake image'), 'slip.jpg')
        .expect(HttpStatus.CREATED);

      expect(response.body.isSuccessful).toBe(true);
    });
  });

  describe(`GET ${API_PATH}/bank-transfer`, () => {
    it('should get bank transfers successfully', async () => {
      vi.spyOn(paymentService, 'getPayments').mockResolvedValue([
        { id: 'payment-1', type: 'Bank Transfer' },
      ] as never);

      const response = await request(app.getHttpServer())
        .get(`${API_PATH}/bank-transfer`)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(true);
    });
  });

  describe(`GET ${API_PATH}`, () => {
    it('should get all payments successfully', async () => {
      vi.spyOn(paymentService, 'getPayments').mockResolvedValue([
        { id: 'payment-1' },
        { id: 'payment-2' },
      ] as never);

      const response = await request(app.getHttpServer())
        .get(API_PATH)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(true);
    });
  });

  describe(`GET ${API_PATH}/my-payments`, () => {
    it('should get user payments successfully', async () => {
      vi.spyOn(paymentService, 'getMyPayments').mockResolvedValue([
        { id: 'payment-1', userId: 'user-123' },
      ] as never);

      const response = await request(app.getHttpServer())
        .get(`${API_PATH}/my-payments`)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(true);
      expect(paymentService.getMyPayments).toHaveBeenCalledWith('user-123');
    });
  });
});
