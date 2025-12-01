import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation } from '@nestjs/swagger';

import { ApiOkSingleResponse } from '@/common/decorators/api-ok-response.decorator';
import { CommonErrorResponses } from '@/common/docs/api-common-error.doc';
import { AddItemResponse } from '@/domains/cart/controller/contracts/add-item.response';

export const ApiDocAddItemDoc = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Add item to cart',
      description:
        'Add a course to the user cart. If the course already exists in cart, returns an error.',
    }),
    ApiOkSingleResponse({
      description: 'Item added to cart successfully',
      type: AddItemResponse,
    }),
    ApiBadRequestResponse({
      description: 'Bad request - Course already in cart or invalid course ID',
    }),
    CommonErrorResponses(),
  );
