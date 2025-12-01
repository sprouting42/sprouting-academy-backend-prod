import { Module } from '@nestjs/common';

import { CartController } from '@/domains/cart/controller/cart.controller';
import { CartRepository } from '@/domains/cart/repositories/cart.repository';
import { CartService } from '@/domains/cart/services/cart.service';
import { DatabaseModule } from '@/infrastructures/database/database.module';
import { LoggerModule } from '@/modules/logger/logger.module';

@Module({
  imports: [LoggerModule, DatabaseModule],
  controllers: [CartController],
  providers: [
    {
      provide: CartService.TOKEN,
      useClass: CartService,
    },
    {
      provide: CartRepository.TOKEN,
      useClass: CartRepository,
    },
  ],
})
export class CartModule {}
