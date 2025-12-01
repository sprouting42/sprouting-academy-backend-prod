import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiDocCreateEnrollment() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create enrollment',
      description:
        'Enroll in a course (requires authentication, payment not required yet)',
    }),
  );
}
