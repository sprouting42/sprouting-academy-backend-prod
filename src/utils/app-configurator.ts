import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import compression from 'compression';
import helmet from 'helmet';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';
import { DEFAULT_SCALAR } from '@/constants/meta-data';
import { EnvVariables } from '@/modules/config/dto/config.dto';
import { AppLoggerService } from '@/modules/logger/services/app-logger.service';

export class AppConfigurator {
  static addSecurity(app: INestApplication): void {
    app.use(
      EnvVariables.isProduction
        ? helmet()
        : helmet({
            contentSecurityPolicy: false,
          }),
    );
    app.use(compression());
  }

  static addCors(app: INestApplication): void {
    app.enableCors({
      origin: EnvVariables.instance.ALLOW_URL.split(','),
      credentials: true,
    });
  }

  static addLogger(app: INestApplication): void {
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  }

  static addValidation(app: INestApplication): void {
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
  }

  static addApi(app: INestApplication): void {
    app.setGlobalPrefix(`api/${EnvVariables.instance.API_VERSION}`);
  }

  static addInterceptors(app: INestApplication): void {
    const logger = app.get(AppLoggerService);

    app.useGlobalInterceptors(new LoggingInterceptor(logger));
    app.useGlobalFilters(new AllExceptionsFilter(logger));
  }

  static addScalar(app: INestApplication): void {
    if (EnvVariables.isProduction) return;

    const config = new DocumentBuilder()
      .setTitle(DEFAULT_SCALAR.TITLE)
      .setDescription(DEFAULT_SCALAR.DESCRIPTION)
      .setVersion(DEFAULT_SCALAR.VERSION)
      .setContact(
        DEFAULT_SCALAR.CONTACT_NAME,
        DEFAULT_SCALAR.CONTACT_URL,
        DEFAULT_SCALAR.CONTACT_EMAIL,
      )
      .setTermsOfService(DEFAULT_SCALAR.TERMS_OF_SERVICE)
      .setLicense(DEFAULT_SCALAR.LICENSE_NAME, DEFAULT_SCALAR.LICENSE_URL)
      .addBearerAuth({
        type: DEFAULT_SCALAR.AUTH.TYPE,
        scheme: DEFAULT_SCALAR.AUTH.SCHEME,
        bearerFormat: DEFAULT_SCALAR.AUTH.BEARER_FORMAT,
      })
      .build();

    const document = SwaggerModule.createDocument(app, config);

    app.use(
      `/api/${DEFAULT_SCALAR.SERVE_ROOT}`,
      apiReference({
        content: document,
        theme: DEFAULT_SCALAR.THEME,
        layout: DEFAULT_SCALAR.LAYOUT,
      }),
    );
  }
}
