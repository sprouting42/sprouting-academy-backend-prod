import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiDocGetMyEnrollments() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get my enrollments',
      description:
        'Get all enrollments for the authenticated user (requires authentication)',
    }),
  );
}
