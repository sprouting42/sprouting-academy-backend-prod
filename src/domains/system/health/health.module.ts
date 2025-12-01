import { Module } from '@nestjs/common';

import { HealthController } from '@/domains/system/health/controller/health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
