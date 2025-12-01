import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { EnvVariables } from '@/modules/config/dto/config.dto';
import { envValidationSchema } from '@/modules/config/validation/config.validation';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema,
      validate: (config: Record<string, unknown>) =>
        EnvVariables.initialize(config),
    }),
  ],
})
export class ConfigModule {}
