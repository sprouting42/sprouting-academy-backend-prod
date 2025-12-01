import { Module } from '@nestjs/common';

import { HealthModule } from '@/domains/system/health/health.module';

@Module({
  imports: [HealthModule],
})
export class SystemModule {}
