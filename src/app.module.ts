import { Module } from '@nestjs/common';

import { AuthModule } from '@/domains/auth/auth.module';
import { CartModule } from '@/domains/cart/cart.module';
import { EnrollmentModule } from '@/domains/enrollment/enrollment.module';
import { OrderModule } from '@/domains/order/order.module';
import { PaymentModule } from '@/domains/payment/payment.module';
import { SystemModule } from '@/domains/system/system.module';
import { DatabaseModule } from '@/infrastructures/database/database.module';
import { SupabaseModule } from '@/infrastructures/supabase/supabase.module';
import { ConfigModule } from '@/modules/config/config.module';
import { InterceptorModule } from '@/modules/interceptor/interceptor.module';
import { LoggerModule } from '@/modules/logger/logger.module';
import { ThrottlerModule } from '@/modules/throttler/throttler.module';

@Module({
  imports: [
    // Core modules
    ConfigModule,
    LoggerModule,
    ThrottlerModule,
    InterceptorModule,

    // Infrastructure modules
    SupabaseModule,
    DatabaseModule,

    // Domain modules
    SystemModule,
    AuthModule,
    CartModule,
    EnrollmentModule,
    OrderModule,
    PaymentModule,
  ],
})
export class AppModule {}
