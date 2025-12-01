import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';

export const CommonErrorResponses = () =>
  applyDecorators(
    ApiBadRequestResponse({
      description: 'Invalid request data or parameters',
    }),
    ApiInternalServerErrorResponse({
      description: 'Unexpected server error occurred',
    }),
  );
