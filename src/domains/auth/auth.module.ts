import { Module } from '@nestjs/common';

import { AuthController } from '@/domains/auth/controller/auth.controller';
import { AuthRepository } from '@/domains/auth/repositories/auth.repository';
import { AuthService } from '@/domains/auth/services/auth.service';
import { DatabaseModule } from '@/infrastructures/database/database.module';
import { LoggerModule } from '@/modules/logger/logger.module';

@Module({
  imports: [LoggerModule, DatabaseModule],
  controllers: [AuthController],
  providers: [
    {
      provide: AuthService.TOKEN,
      useClass: AuthService,
    },
    {
      provide: AuthRepository.TOKEN,
      useClass: AuthRepository,
    },
  ],
})
export class AuthModule {}
