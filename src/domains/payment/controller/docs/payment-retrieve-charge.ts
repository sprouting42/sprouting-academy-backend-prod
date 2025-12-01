import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ApiOkSingleResponse } from '@/common/decorators/api-ok-response.decorator';
import { CommonErrorResponses } from '@/common/docs/api-common-error.doc';
import { RetrieveChargeResponse } from '@/domains/payment/controller/contracts/retrieve-charge.response';

export const ApiDocPaymentRetrieveChargeDoc = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Retrieve payment charge',
      description:
        'Retrieve payment charge details by Omise charge ID. Syncs with Omise to get latest status.',
    }),
    ApiOkSingleResponse({
      description: 'Charge retrieved successfully',
      type: RetrieveChargeResponse,
    }),
    ApiBadRequestResponse({
      description: 'Bad request - Invalid charge ID',
    }),
    ApiNotFoundResponse({
      description: 'Not found - Payment record not found',
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized - Authentication required',
    }),
    CommonErrorResponses(),
  );
