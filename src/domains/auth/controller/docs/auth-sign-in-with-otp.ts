import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation } from '@nestjs/swagger';

import { ApiOkSingleResponse } from '@/common/decorators/api-ok-response.decorator';
import { CommonErrorResponses } from '@/common/docs/api-common-error.doc';
import { OtpSentResponse } from '@/domains/auth/controller/contracts/otp.response';

export const ApiDocSignInWithOtpDoc = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Sign in or sign up with OTP (passwordless)',
      description:
        'Send a one-time password (OTP) to the provided email address. Works for both new and existing users. If fullName and phone are provided, they will be used for new user registration.',
    }),
    ApiOkSingleResponse({
      description: 'OTP sent successfully to email',
      type: OtpSentResponse,
    }),
    ApiBadRequestResponse({
      description: 'Bad request - Invalid email address',
    }),
    CommonErrorResponses(),
  );
