/* eslint-disable @typescript-eslint/unbound-method */
import './mocks/app-configurator.mock';
import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';
import { DEFAULT_SCALAR } from '@/constants/meta-data';
import { EnvVariables } from '@/modules/config/dto/config.dto';
import { AppLoggerService } from '@/modules/logger/services/app-logger.service';
import { AppConfigurator } from '@/utils/app-configurator';

import { createMockApp, createMockLogger } from './mocks/app-configurator.mock';

describe('AppConfigurator', () => {
  let mockApp: INestApplication;
  let mockLogger: AppLoggerService;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockApp = createMockApp(mockLogger);
  });

  describe('addSecurity', () => {
    it('should add helmet and compression middleware in production', () => {
      vi.spyOn(EnvVariables, 'isProduction', 'get').mockReturnValue(true);

      AppConfigurator.addSecurity(mockApp);

      expect(mockApp.use).toHaveBeenCalledTimes(2);
      expect(mockApp.use).toHaveBeenCalledWith('helmet-middleware');
      expect(mockApp.use).toHaveBeenCalledWith('compression-middleware');
    });

    it('should add helmet with CSP disabled in non-production', () => {
      vi.spyOn(EnvVariables, 'isProduction', 'get').mockReturnValue(false);

      AppConfigurator.addSecurity(mockApp);

      expect(mockApp.use).toHaveBeenCalledTimes(2);
      expect(mockApp.use).toHaveBeenCalledWith('helmet-middleware');
      expect(mockApp.use).toHaveBeenCalledWith('compression-middleware');
    });
  });

  describe('addCors', () => {
    it('should enable CORS with credentials', () => {
      vi.spyOn(EnvVariables, 'instance', 'get').mockReturnValue({
        ALLOW_URL: 'http://localhost:3000',
      } as EnvVariables);

      AppConfigurator.addCors(mockApp);

      expect(mockApp.enableCors).toHaveBeenCalledWith(
        expect.objectContaining({
          credentials: true,
        }),
      );
    });
  });

  describe('addLogger', () => {
    it('should use Winston logger from provider', () => {
      const mockWinstonLogger = { log: vi.fn() };
      mockApp.get = vi.fn().mockReturnValue(mockWinstonLogger);

      AppConfigurator.addLogger(mockApp);

      expect(mockApp.get).toHaveBeenCalledWith(WINSTON_MODULE_NEST_PROVIDER);
      expect(mockApp.useLogger).toHaveBeenCalledWith(mockWinstonLogger);
    });
  });

  describe('addValidation', () => {
    it('should add global validation pipe with correct options', () => {
      AppConfigurator.addValidation(mockApp);

      expect(mockApp.useGlobalPipes).toHaveBeenCalledWith(
        expect.any(ValidationPipe),
      );
    });

    it('should configure validation pipe with whitelist', () => {
      AppConfigurator.addValidation(mockApp);

      const useSpy = mockApp.useGlobalPipes as ReturnType<typeof vi.fn>;
      const callArgs = useSpy.mock.calls[0];
      const pipe = callArgs?.[0] as ValidationPipe;

      expect(pipe).toBeInstanceOf(ValidationPipe);
    });
  });

  describe('addApi', () => {
    it('should set global prefix with API version', () => {
      const mockVersion = 'v1';
      vi.spyOn(EnvVariables, 'instance', 'get').mockReturnValue({
        API_VERSION: mockVersion,
      } as EnvVariables);

      AppConfigurator.addApi(mockApp);

      expect(mockApp.setGlobalPrefix).toHaveBeenCalledWith(
        `api/${mockVersion}`,
      );
    });

    it('should handle different API versions', () => {
      vi.spyOn(EnvVariables, 'instance', 'get').mockReturnValue({
        API_VERSION: 'v2',
      } as EnvVariables);

      AppConfigurator.addApi(mockApp);

      expect(mockApp.setGlobalPrefix).toHaveBeenCalledWith('api/v2');
    });
  });

  describe('addInterceptors', () => {
    it('should add logging interceptor', () => {
      AppConfigurator.addInterceptors(mockApp);

      expect(mockApp.get).toHaveBeenCalledWith(AppLoggerService);
      expect(mockApp.useGlobalInterceptors).toHaveBeenCalledWith(
        expect.any(LoggingInterceptor),
      );
    });

    it('should add exception filter', () => {
      AppConfigurator.addInterceptors(mockApp);

      expect(mockApp.useGlobalFilters).toHaveBeenCalledWith(
        expect.any(AllExceptionsFilter),
      );
    });

    it('should use the same logger instance for both', () => {
      AppConfigurator.addInterceptors(mockApp);

      expect(mockApp.get).toHaveBeenCalledTimes(1);
      expect(mockApp.get).toHaveBeenCalledWith(AppLoggerService);
    });
  });

  describe('addScalar', () => {
    beforeEach(() => {
      vi.spyOn(SwaggerModule, 'createDocument').mockReturnValue(
        {} as ReturnType<typeof SwaggerModule.createDocument>,
      );
    });

    it('should not add Scalar in production', () => {
      vi.spyOn(EnvVariables, 'isProduction', 'get').mockReturnValue(true);

      AppConfigurator.addScalar(mockApp);

      expect(mockApp.use).not.toHaveBeenCalled();
    });

    it('should add Scalar in non-production', () => {
      vi.spyOn(EnvVariables, 'isProduction', 'get').mockReturnValue(false);

      AppConfigurator.addScalar(mockApp);

      expect(SwaggerModule.createDocument).toHaveBeenCalled();
      expect(mockApp.use).toHaveBeenCalledWith(
        `/api/${DEFAULT_SCALAR.SERVE_ROOT}`,
        'scalar-middleware',
      );
    });

    it('should build Swagger config with default metadata', () => {
      vi.spyOn(EnvVariables, 'isProduction', 'get').mockReturnValue(false);
      const buildSpy = vi.spyOn(DocumentBuilder.prototype, 'build');

      AppConfigurator.addScalar(mockApp);

      expect(buildSpy).toHaveBeenCalled();
    });

    it('should configure DocumentBuilder with correct metadata', () => {
      vi.spyOn(EnvVariables, 'isProduction', 'get').mockReturnValue(false);

      const setTitleSpy = vi.spyOn(DocumentBuilder.prototype, 'setTitle');
      const setDescriptionSpy = vi.spyOn(
        DocumentBuilder.prototype,
        'setDescription',
      );
      const setVersionSpy = vi.spyOn(DocumentBuilder.prototype, 'setVersion');

      AppConfigurator.addScalar(mockApp);

      expect(setTitleSpy).toHaveBeenCalledWith(DEFAULT_SCALAR.TITLE);
      expect(setDescriptionSpy).toHaveBeenCalledWith(
        DEFAULT_SCALAR.DESCRIPTION,
      );
      expect(setVersionSpy).toHaveBeenCalledWith(DEFAULT_SCALAR.VERSION);
    });

    it('should add bearer auth configuration', () => {
      vi.spyOn(EnvVariables, 'isProduction', 'get').mockReturnValue(false);

      const addBearerAuthSpy = vi.spyOn(
        DocumentBuilder.prototype,
        'addBearerAuth',
      );

      AppConfigurator.addScalar(mockApp);

      expect(addBearerAuthSpy).toHaveBeenCalledWith({
        type: DEFAULT_SCALAR.AUTH.TYPE,
        scheme: DEFAULT_SCALAR.AUTH.SCHEME,
        bearerFormat: DEFAULT_SCALAR.AUTH.BEARER_FORMAT,
      });
    });
  });

  describe('static class', () => {
    it('should have all static methods', () => {
      expect(typeof AppConfigurator.addSecurity).toBe('function');
      expect(typeof AppConfigurator.addCors).toBe('function');
      expect(typeof AppConfigurator.addLogger).toBe('function');
      expect(typeof AppConfigurator.addValidation).toBe('function');
      expect(typeof AppConfigurator.addApi).toBe('function');
      expect(typeof AppConfigurator.addInterceptors).toBe('function');
      expect(typeof AppConfigurator.addScalar).toBe('function');
    });

    it('should be a class', () => {
      expect(AppConfigurator).toBeDefined();
      expect(typeof AppConfigurator).toBe('function');
    });
  });

  describe('integration scenarios', () => {
    it('should configure app in correct order', () => {
      vi.spyOn(EnvVariables, 'isProduction', 'get').mockReturnValue(false);
      vi.spyOn(EnvVariables, 'instance', 'get').mockReturnValue({
        ALLOW_URL: 'http://localhost:3000',
        API_VERSION: 'v1',
      } as EnvVariables);

      AppConfigurator.addSecurity(mockApp);
      AppConfigurator.addCors(mockApp);
      AppConfigurator.addLogger(mockApp);
      AppConfigurator.addValidation(mockApp);
      AppConfigurator.addApi(mockApp);
      AppConfigurator.addInterceptors(mockApp);
      AppConfigurator.addScalar(mockApp);

      expect(mockApp.use).toHaveBeenCalled();
      expect(mockApp.enableCors).toHaveBeenCalled();
      expect(mockApp.useLogger).toHaveBeenCalled();
      expect(mockApp.useGlobalPipes).toHaveBeenCalled();
      expect(mockApp.setGlobalPrefix).toHaveBeenCalled();
      expect(mockApp.useGlobalInterceptors).toHaveBeenCalled();
      expect(mockApp.useGlobalFilters).toHaveBeenCalled();
    });
  });
});
