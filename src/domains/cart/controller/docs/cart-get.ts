import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { ApiOkSingleResponse } from '@/common/decorators/api-ok-response.decorator';
import { CommonErrorResponses } from '@/common/docs/api-common-error.doc';
import { CartResponse } from '@/domains/cart/controller/contracts/cart.response';

export const ApiDocGetCartDoc = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get user cart',
      description:
        'Retrieve all items in the user cart with course details and total price',
    }),
    ApiOkSingleResponse({
      description: 'Cart retrieved successfully',
      type: CartResponse,
    }),
    CommonErrorResponses(),
  );
