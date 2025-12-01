import { Module } from '@nestjs/common';

import { LoggerModule } from '@/modules/logger/logger.module';

import { OmiseService } from './services/omise.service';

@Module({
  imports: [LoggerModule],
  providers: [
    {
      provide: OmiseService.TOKEN,
      useClass: OmiseService,
    },
  ],
  exports: [OmiseService.TOKEN],
})
export class OmiseModule {}
