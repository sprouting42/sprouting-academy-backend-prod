import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ApiOkSingleResponse } from '@/common/decorators/api-ok-response.decorator';
import { CommonErrorResponses } from '@/common/docs/api-common-error.doc';
import { VerifyOtpResponse } from '@/domains/auth/controller/contracts/verify-otp.response';

export const ApiDocVerifyOtpDoc = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Verify OTP and receive access tokens',
      description:
        'Verify the OTP code sent to email and receive access tokens. Creates a new user profile if this is the first time signing in.',
    }),
    ApiOkSingleResponse({
      description:
        'OTP verified successfully, returns access token and user profile',
      type: VerifyOtpResponse,
    }),
    ApiBadRequestResponse({
      description: 'Bad request - Invalid email or OTP format',
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized - Invalid or expired OTP code',
    }),
    CommonErrorResponses(),
  );
