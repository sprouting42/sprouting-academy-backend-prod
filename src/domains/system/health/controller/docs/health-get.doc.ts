import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';

import { HealthResponse } from '@/domains/system/health/controller/contracts/health.response';

export function ApiDocHealthGet() {
  return applyDecorators(
    ApiOperation({
      summary: 'Health check endpoint',
      description:
        'Returns the current health status of the application including uptime and system information.',
    }),
    ApiOkResponse({
      description: 'Application is healthy and running normally',
      type: HealthResponse,
    }),
    ApiServiceUnavailableResponse({
      description: 'Application is unhealthy or experiencing issues',
    }),
  );
}
