import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ApiOkSingleResponse } from '@/common/decorators/api-ok-response.decorator';
import { CommonErrorResponses } from '@/common/docs/api-common-error.doc';
import { CreateChargeResponse } from '@/domains/payment/controller/contracts/create-charge.response';

export const ApiDocPaymentCreateChargeDoc = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create payment charge',
      description:
        'Create a payment charge using Omise. Requires order ID and card details (card number, card name, expiration month, expiration year, security code). The system will create an Omise token from the card details and then create the charge.',
    }),
    ApiOkSingleResponse({
      description: 'Charge created successfully',
      type: CreateChargeResponse,
    }),
    ApiBadRequestResponse({
      description: 'Bad request - Invalid input data',
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized - Authentication required',
    }),
    CommonErrorResponses(),
  );
