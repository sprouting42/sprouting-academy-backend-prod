import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiDocGetEnrollmentById() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get enrollment by ID',
      description:
        'Get enrollment details by enrollment ID (requires authentication)',
    }),
  );
}
