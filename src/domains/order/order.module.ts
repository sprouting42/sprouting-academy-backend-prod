import { Module } from '@nestjs/common';

import { OrderController } from '@/domains/order/controller/order.controller';
import { OrderRepository } from '@/domains/order/repositories/order.repository';
import { OrderService } from '@/domains/order/services/order.service';
import { DatabaseModule } from '@/infrastructures/database/database.module';
import { LoggerModule } from '@/modules/logger/logger.module';

@Module({
  imports: [LoggerModule, DatabaseModule],
  controllers: [OrderController],
  providers: [
    {
      provide: OrderService.TOKEN,
      useClass: OrderService,
    },
    {
      provide: OrderRepository.TOKEN,
      useClass: OrderRepository,
    },
  ],
  exports: [OrderService.TOKEN, OrderRepository.TOKEN],
})
export class OrderModule {}
