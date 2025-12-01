import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation } from '@nestjs/swagger';

import { ApiOkSingleResponse } from '@/common/decorators/api-ok-response.decorator';
import { CommonErrorResponses } from '@/common/docs/api-common-error.doc';
import { RefreshTokenResponse } from '@/domains/auth/controller/contracts/refresh-token.response';

export const ApiDocRefreshTokenDoc = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Refresh access token',
      description:
        'Refresh the access token using a valid refresh token. This endpoint allows clients to obtain a new access token without requiring the user to re-authenticate.',
    }),
    ApiOkSingleResponse({
      description: 'Token refreshed successfully',
      type: RefreshTokenResponse,
    }),
    ApiBadRequestResponse({
      description: 'Invalid or expired refresh token',
    }),
    CommonErrorResponses(),
  );
