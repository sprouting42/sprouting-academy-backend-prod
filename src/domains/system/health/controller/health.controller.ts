import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';

import { SkipThrottleDecorator } from '@/common/decorators/rate-limit.decorator';
import { API_CONTROLLER_CONFIG } from '@/constants/api-controller';
import { HealthResponse } from '@/domains/system/health/controller/contracts/health.response';
import { ApiDocHealthGet } from '@/domains/system/health/controller/docs/health-get.doc';
import { NodeEnv } from '@/enums/node-env.enum';

@ApiTags(API_CONTROLLER_CONFIG.HEALTH.TAG)
@Controller(API_CONTROLLER_CONFIG.HEALTH.PREFIX)
export class HealthController {
  @Get(API_CONTROLLER_CONFIG.HEALTH.ROUTE.GET_HEALTH)
  @SkipThrottleDecorator()
  @ApiExcludeEndpoint()
  @HttpCode(HttpStatus.OK)
  @ApiDocHealthGet()
  getHealth(): HealthResponse {
    const now = new Date();
    return HealthResponse.create({
      status: HttpStatus.OK.toString(),
      timestamp: now.toISOString(),
      uptime: Math.floor(process.uptime()),
      version: process.env.npm_package_version,
      environment: process.env.NODE_ENV ?? NodeEnv.DEVELOPMENT,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    });
  }
}
