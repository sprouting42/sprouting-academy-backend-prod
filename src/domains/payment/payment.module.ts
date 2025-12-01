import { Module } from '@nestjs/common';

import { DatabaseModule } from '@/infrastructures/database/database.module';
import { SupabaseModule } from '@/infrastructures/supabase/supabase.module';
import { LoggerModule } from '@/modules/logger/logger.module';
import { OmiseModule } from '@/modules/omise/omise.module';
import { WebhookModule } from '@/modules/webhook/webhook.module';

import { PaymentController } from './controller/payment.controller';
// CouponRepository removed - feature not implemented yet
// import { CouponRepository } from './repositories/coupon.repository';
import { PaymentRepository } from './repositories/payment.repository';
import { BankTransferService } from './services/bank-transfer.service';
import { CreditCardService } from './services/credit-card.service';
import { PaymentValidationService } from './services/payment-validation.service';
import { PaymentService } from './services/payment.service';

/**
 * PaymentModule
 *
 * Following Clean Architecture principles:
 * - Domain repositories (adapters) wrap infrastructure layer
 * - Services contain business logic
 * - Clear separation of concerns like AuthModule
 */
@Module({
  imports: [
    LoggerModule,
    OmiseModule,
    DatabaseModule,
    SupabaseModule,
    WebhookModule,
  ],
  controllers: [PaymentController],
  providers: [
    // Domain Repositories (Adapters) - registered first
    {
      provide: PaymentRepository.TOKEN,
      useClass: PaymentRepository,
    },
    {
      provide: CreditCardService.TOKEN,
      useClass: CreditCardService,
    },
    {
      provide: PaymentValidationService.TOKEN,
      useClass: PaymentValidationService,
    },
    {
      provide: BankTransferService.TOKEN,
      useClass: BankTransferService,
    },
    // Orchestration Service - depends on specialized services
    {
      provide: PaymentService.TOKEN,
      useClass: PaymentService,
    },
  ],
  exports: [
    PaymentService.TOKEN,
    PaymentRepository.TOKEN,
    BankTransferService.TOKEN,
    CreditCardService.TOKEN,
    PaymentValidationService.TOKEN,
  ],
})
export class PaymentModule {}
