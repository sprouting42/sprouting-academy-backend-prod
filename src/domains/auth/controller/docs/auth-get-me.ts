import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { ApiOkSingleResponse } from '@/common/decorators/api-ok-response.decorator';
import { CommonErrorResponses } from '@/common/docs/api-common-error.doc';
import { UserProfileResponse } from '@/domains/auth/controller/contracts/user-profile.reponse';

export const ApiDocGetMeDoc = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get current user profile',
      description:
        'Get the currently authenticated user information. Requires a valid access token.',
    }),
    ApiBearerAuth(),
    ApiOkSingleResponse({
      description: 'User profile retrieved successfully',
      type: UserProfileResponse,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized - Invalid or missing access token',
    }),
    CommonErrorResponses(),
  );
