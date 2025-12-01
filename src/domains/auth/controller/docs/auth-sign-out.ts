import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { ApiOkSingleResponse } from '@/common/decorators/api-ok-response.decorator';
import { CommonErrorResponses } from '@/common/docs/api-common-error.doc';
import { SignOutResponse } from '@/domains/auth/controller/contracts/sign-out.response';

export const ApiDocSignOutDoc = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Sign out and invalidate session',
      description:
        'Sign out the current user and invalidate their session. Requires a valid access token.',
    }),
    ApiBearerAuth(),
    ApiOkSingleResponse({
      description: 'Successfully signed out',
      type: SignOutResponse,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized - Invalid or missing access token',
    }),
    CommonErrorResponses(),
  );
