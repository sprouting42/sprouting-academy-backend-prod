import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { LoggerModule } from '@/modules/logger/logger.module';

import { WebhookService } from './services/webhook.service';

/**
 * WebhookModule
 *
 * Provides webhook functionality for sending events to external services
 */
@Module({
  imports: [ConfigModule, LoggerModule],
  providers: [
    {
      provide: WebhookService.TOKEN,
      useClass: WebhookService,
    },
  ],
  exports: [WebhookService.TOKEN],
})
export class WebhookModule {}
