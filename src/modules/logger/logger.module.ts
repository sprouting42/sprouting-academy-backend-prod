import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';

import { AppLoggerService } from '@/modules/logger/services/app-logger.service';

import { winstonTransports } from './logger.config';

const serviceProviders = [AppLoggerService];

@Module({
  imports: [
    WinstonModule.forRootAsync({
      useFactory: () => ({
        transports: winstonTransports,
      }),
    }),
  ],
  providers: serviceProviders,
  exports: serviceProviders,
})
export class LoggerModule {}
