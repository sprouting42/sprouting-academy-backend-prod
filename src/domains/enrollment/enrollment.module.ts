import { Module } from '@nestjs/common';

import { DatabaseModule } from '@/infrastructures/database/database.module';
import { LoggerModule } from '@/modules/logger/logger.module';

import { EnrollmentController } from './controller/enrollment.controller';
import { EnrollmentRepository } from './repositories/enrollment.repository';
import { EnrollmentService } from './services/enrollment.service';

@Module({
  imports: [LoggerModule, DatabaseModule],
  controllers: [EnrollmentController],
  providers: [
    {
      provide: EnrollmentRepository.TOKEN,
      useClass: EnrollmentRepository,
    },
    {
      provide: EnrollmentService.TOKEN,
      useClass: EnrollmentService,
    },
  ],
  exports: [EnrollmentService.TOKEN, EnrollmentRepository.TOKEN],
})
export class EnrollmentModule {}
