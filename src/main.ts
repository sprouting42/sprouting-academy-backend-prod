import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { EnvVariables } from '@/modules/config/dto/config.dto';
import { AppConfigurator } from '@/utils/app-configurator';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  EnvVariables.initialize(app.get(ConfigService));

  AppConfigurator.addLogger(app);
  AppConfigurator.addSecurity(app);
  AppConfigurator.addCors(app);
  AppConfigurator.addInterceptors(app);
  AppConfigurator.addValidation(app);
  AppConfigurator.addApi(app);
  AppConfigurator.addScalar(app);

  await app.listen(EnvVariables.instance.PORT);
}

void bootstrap();
