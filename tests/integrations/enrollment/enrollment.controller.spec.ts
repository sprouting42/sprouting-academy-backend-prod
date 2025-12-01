/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/**
 * Integration tests for Enrollment Controller
 */
import type { INestApplication } from '@nestjs/common';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { ResponseOutputWithContent } from '@/common/response/response-output';
import { API_CONTROLLER_CONFIG } from '@/constants/api-controller';
import { EnrollmentController } from '@/domains/enrollment/controller/enrollment.controller';
import { EnrollmentService } from '@/domains/enrollment/services/enrollment.service';
import type { IEnrollmentService } from '@/domains/enrollment/services/interfaces/enrollment.service.interface';
import { UserRole } from '@/infrastructures/database/enums/user-role';

// Mock API_CONTROLLER_CONFIG to prevent undefined error in decorators
vi.mock('@/constants/api-controller', () => ({
  API_CONTROLLER_CONFIG: {
    ENROLLMENT: {
      PREFIX: 'enrollment',
      TAG: 'Enrollment',
      ROUTE: {
        CREATE: '',
        GET_BY_ID: ':id',
        GET_MY_ENROLLMENTS: '',
      },
    },
  },
}));

// Mock SupabaseConnector to prevent TOKEN undefined error
vi.mock('@/infrastructures/supabase/services/supabase.connector', () => ({
  SupabaseConnector: {
    TOKEN: Symbol('SupabaseConnector'),
  },
}));

// Mock AuthenticationGuard to prevent invalid guard error
vi.mock('@/common/guards/authentication.guard', () => ({
  AuthenticationGuard: vi.fn().mockImplementation(() => ({
    canActivate: () => true,
  })),
}));

// Mock RolesGuard to prevent invalid guard error
vi.mock('@/common/guards/roles.guard', () => ({
  RolesGuard: vi.fn().mockImplementation(() => ({
    canActivate: () => true,
  })),
}));

// Mock EnrollmentRepository to prevent inheritance error
vi.mock('@/domains/enrollment/repositories/enrollment.repository', () => ({
  EnrollmentRepository: {
    TOKEN: Symbol('EnrollmentRepository'),
  },
}));

// Mock WebhookService to prevent TOKEN undefined error
vi.mock('@/modules/webhook/services/webhook.service', () => ({
  WebhookService: {
    TOKEN: Symbol('WebhookService'),
  },
}));

describe('Enrollment Controller Integration', () => {
  const API_PATH = `/${API_CONTROLLER_CONFIG.ENROLLMENT.PREFIX}`;
  let app: INestApplication<never>;
  let moduleFixture: TestingModule;
  let enrollmentService: IEnrollmentService;

  const mockUser = {
    userId: 'user-123',
    email: 'test@example.com',
    role: UserRole.STUDENT,
  };

  beforeEach(async () => {
    const mockEnrollmentService: Partial<IEnrollmentService> = {
      createEnrollment: vi.fn(),
      getEnrollmentById: vi.fn(),
      getMyEnrollments: vi.fn(),
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
      controllers: [EnrollmentController],
      providers: [
        {
          provide: EnrollmentService.TOKEN,
          useValue: mockEnrollmentService,
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

    enrollmentService = moduleFixture.get<IEnrollmentService>(
      EnrollmentService.TOKEN,
    );
  });

  afterEach(async () => {
    await app.close();
  });

  describe(`POST ${API_PATH}`, () => {
    it('should create enrollment successfully', async () => {
      const mockResponse = ResponseOutputWithContent.successWithContent(
        {},
        {
          id: 'enrollment-123',
          userId: 'user-123',
          courseId: 'course-123',
          course: 'Test Course',
          coursePrice: 1000,
        },
      );

      vi.spyOn(enrollmentService, 'createEnrollment').mockResolvedValue(
        mockResponse as never,
      );

      const response = await request(app.getHttpServer())
        .post(API_PATH)
        .send({
          courseId: '550e8400-e29b-41d4-a716-446655440000',
        })
        .expect(HttpStatus.CREATED);

      expect(response.body.isSuccessful).toBe(true);
      expect(enrollmentService.createEnrollment).toHaveBeenCalledWith({
        userId: 'user-123',
        courseId: '550e8400-e29b-41d4-a716-446655440000',
      });
    });

    it('should fail with invalid UUID', async () => {
      await request(app.getHttpServer())
        .post(API_PATH)
        .send({
          courseId: 'invalid-uuid',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should fail with missing courseId', async () => {
      await request(app.getHttpServer())
        .post(API_PATH)
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe(`GET ${API_PATH}/:id`, () => {
    it('should get enrollment by id successfully', async () => {
      const mockResponse = ResponseOutputWithContent.successWithContent(
        {},
        {
          id: 'enrollment-123',
          userId: 'user-123',
          courseId: 'course-123',
          course: 'Test Course',
        },
      );

      vi.spyOn(enrollmentService, 'getEnrollmentById').mockResolvedValue(
        mockResponse as never,
      );

      const response = await request(app.getHttpServer())
        .get(`${API_PATH}/enrollment-123`)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(true);
      expect(enrollmentService.getEnrollmentById).toHaveBeenCalledWith(
        'enrollment-123',
      );
    });
  });

  describe(`GET ${API_PATH}`, () => {
    it('should get user enrollments successfully', async () => {
      const mockResponse = ResponseOutputWithContent.successWithContent({}, [
        {
          id: 'enrollment-1',
          userId: 'user-123',
          courseId: 'course-1',
          course: 'Course 1',
        },
        {
          id: 'enrollment-2',
          userId: 'user-123',
          courseId: 'course-2',
          course: 'Course 2',
        },
      ]);

      vi.spyOn(enrollmentService, 'getMyEnrollments').mockResolvedValue(
        mockResponse as never,
      );

      const response = await request(app.getHttpServer())
        .get(API_PATH)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(true);
      expect(enrollmentService.getMyEnrollments).toHaveBeenCalledWith(
        'user-123',
      );
    });

    it('should return empty array when user has no enrollments', async () => {
      const mockResponse = ResponseOutputWithContent.successWithContent({}, []);

      vi.spyOn(enrollmentService, 'getMyEnrollments').mockResolvedValue(
        mockResponse as never,
      );

      const response = await request(app.getHttpServer())
        .get(API_PATH)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(true);
    });
  });
});
