import { Module } from '@nestjs/common';

import { PrismaDatabase } from '@/infrastructures/database/prisma/prisma-database';
import { CartItemRepository } from '@/infrastructures/database/repositories/cart-item.repository';
import { CartRepository } from '@/infrastructures/database/repositories/cart.repository';
import { CourseRepository } from '@/infrastructures/database/repositories/course.repository';
import { EnrollmentRepository } from '@/infrastructures/database/repositories/enrollment.repository';
import { OrderRepository } from '@/infrastructures/database/repositories/order.repository';
import { PaymentRepository } from '@/infrastructures/database/repositories/payment.repository';
import { UserRepository } from '@/infrastructures/database/repositories/user.repository';
import { LoggerModule } from '@/modules/logger/logger.module';

const repositories = [
  UserRepository,
  CartRepository,
  CartItemRepository,
  CourseRepository,
  PaymentRepository,
  EnrollmentRepository,
  OrderRepository,
] as const;

@Module({
  imports: [LoggerModule],
  providers: [
    PrismaDatabase,
    ...repositories,
    // Register repositories with TOKEN for dependency injection
    {
      provide: EnrollmentRepository.TOKEN,
      useClass: EnrollmentRepository,
    },
    {
      provide: OrderRepository.TOKEN,
      useClass: OrderRepository,
    },
  ],
  exports: [
    PrismaDatabase,
    ...repositories,
    // Export repositories with TOKEN
    EnrollmentRepository.TOKEN,
    OrderRepository.TOKEN,
  ],
})
export class DatabaseModule {}
