/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/**
 * Integration tests for Order Controller
 */
import type { INestApplication } from '@nestjs/common';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { ResponseOutputWithContent } from '@/common/response/response-output';
import { API_CONTROLLER_CONFIG } from '@/constants/api-controller';
import { OrderController } from '@/domains/order/controller/order.controller';
import type { IOrderService } from '@/domains/order/services/interfaces/order.service.interface';
import { OrderService } from '@/domains/order/services/order.service';
import { UserRole } from '@/infrastructures/database/enums/user-role';

// Mock API_CONTROLLER_CONFIG to prevent undefined error in decorators
vi.mock('@/constants/api-controller', () => ({
  API_CONTROLLER_CONFIG: {
    ORDER: {
      PREFIX: 'order',
      TAG: 'Order',
      ROUTE: {
        CREATE: '',
      },
    },
  },
}));

// Mock ApiDocLanguageHeader decorator
vi.mock('@/common/docs/api-language-header.doc', () => ({
  ApiDocLanguageHeader: () => vi.fn(),
}));

// Mock BaseController to prevent "Class extends value undefined" error
vi.mock('@/common/controllers/base.controller', () => ({
  BaseController: class {
    protected actionResponse<TResponse>(result: TResponse): TResponse {
      return result;
    }
    protected actionResponseError(
      _language: unknown,
      error: unknown,
      _input?: unknown,
    ): { isSuccessful: boolean; error: unknown } {
      return { isSuccessful: false, error };
    }
  },
}));

// Mock OrderRepository to prevent undefined TOKEN error
vi.mock('@/domains/order/repositories/order.repository', () => ({
  OrderRepository: {
    TOKEN: Symbol('OrderRepository'),
  },
}));

// Mock SupabaseManager to prevent TOKEN undefined error
vi.mock('@/infrastructures/supabase/services/supabase.manager', () => ({
  SupabaseManager: {
    TOKEN: Symbol('SupabaseManager'),
  },
}));

// Mock RolesGuard to prevent invalid guard error
vi.mock('@/common/guards/roles.guard', () => ({
  RolesGuard: vi.fn().mockImplementation(() => ({
    canActivate: () => true,
  })),
}));

// Mock AuthenticationGuard to prevent invalid guard error
vi.mock('@/common/guards/authentication.guard', () => ({
  AuthenticationGuard: vi.fn().mockImplementation(() => ({
    canActivate: () => true,
  })),
}));

describe('Order Controller Integration', () => {
  const API_PATH = `/${API_CONTROLLER_CONFIG.ORDER?.PREFIX ?? 'order'}`;
  let app: INestApplication<never>;
  let moduleFixture: TestingModule;
  let orderService: IOrderService;

  const mockUser = {
    userId: 'user-123',
    email: 'test@example.com',
    role: UserRole.STUDENT,
  };

  beforeEach(async () => {
    const mockOrderService: Partial<IOrderService> = {
      createOrder: vi.fn(),
      getOrderById: vi.fn(),
      getMyOrders: vi.fn(),
    };

    const mockGuard = {
      canActivate: vi.fn((context: any) => {
        const request = context.switchToHttp().getRequest();
        request.user = mockUser;
        // Set language header for CurrentLanguage decorator
        request.headers = { ...request.headers, 'x-language': 'EN' };
        return true;
      }),
    };

    moduleFixture = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService.TOKEN,
          useValue: mockOrderService,
        },
      ],
    })
      .overrideGuard(AuthenticationGuard)
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

    orderService = moduleFixture.get<IOrderService>(OrderService.TOKEN);
  });

  afterEach(async () => {
    await app.close();
  });

  describe(`POST ${API_PATH}`, () => {
    it('should create order successfully', async () => {
      const mockResponse = ResponseOutputWithContent.successWithContent(
        {},
        {
          id: 'order-123',
          subtotalAmount: 3000,
          totalAmount: 3000,
          items: [
            { courseId: 'course-1', unitPrice: 1000 },
            { courseId: 'course-2', unitPrice: 2000 },
          ],
        },
      );

      vi.spyOn(orderService, 'createOrder').mockResolvedValue(
        mockResponse as never,
      );

      const response = await request(app.getHttpServer())
        .post(API_PATH)
        .send({
          items: [
            { courseId: '550e8400-e29b-41d4-a716-446655440000' },
            { courseId: '550e8400-e29b-41d4-a716-446655440001' },
          ],
        })
        .expect(HttpStatus.CREATED);

      expect(response.body.isSuccessful).toBe(true);
      expect(orderService.createOrder).toHaveBeenCalled();
    });

    it('should create order with coupon', async () => {
      const mockResponse = ResponseOutputWithContent.successWithContent(
        {},
        {
          id: 'order-123',
          subtotalAmount: 1000,
          totalAmount: 900,
          couponId: 'coupon-123',
        },
      );

      vi.spyOn(orderService, 'createOrder').mockResolvedValue(
        mockResponse as never,
      );

      const response = await request(app.getHttpServer())
        .post(API_PATH)
        .send({
          items: [{ courseId: '550e8400-e29b-41d4-a716-446655440000' }],
          couponId: '550e8400-e29b-41d4-a716-446655440002',
        })
        .expect(HttpStatus.CREATED);

      expect(response.body.isSuccessful).toBe(true);
    });

    it('should fail with invalid UUID', async () => {
      await request(app.getHttpServer())
        .post(API_PATH)
        .send({
          items: [{ courseId: 'invalid-uuid' }],
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe(`GET ${API_PATH}/:id`, () => {
    it('should get order by id successfully', async () => {
      const mockResponse = ResponseOutputWithContent.successWithContent(
        {},
        {
          id: 'order-123',
          subtotalAmount: 1000,
          totalAmount: 1000,
          items: [],
        },
      );

      vi.spyOn(orderService, 'getOrderById').mockResolvedValue(
        mockResponse as never,
      );

      const response = await request(app.getHttpServer())
        .get(`${API_PATH}/order-123`)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(true);
    });
  });

  describe(`GET ${API_PATH}`, () => {
    it('should get user orders successfully', async () => {
      const mockResponse = ResponseOutputWithContent.successWithContent({}, [
        { id: 'order-1', totalAmount: 1000 },
        { id: 'order-2', totalAmount: 2000 },
      ]);

      vi.spyOn(orderService, 'getMyOrders').mockResolvedValue(
        mockResponse as never,
      );

      const response = await request(app.getHttpServer())
        .get(API_PATH)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(true);
      expect(orderService.getMyOrders).toHaveBeenCalledWith(
        'user-123',
        expect.anything(),
      );
    });
  });
});
