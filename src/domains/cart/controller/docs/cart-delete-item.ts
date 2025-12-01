import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { ApiOkSingleResponse } from '@/common/decorators/api-ok-response.decorator';
import { CommonErrorResponses } from '@/common/docs/api-common-error.doc';
import { DeleteItemResponse } from '@/domains/cart/controller/contracts/delete-item.response';

export const ApiDocDeleteItemDoc = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Delete item from cart',
      description: 'Remove an item from the user cart',
    }),
    ApiOkSingleResponse({
      description: 'Item removed from cart successfully',
      type: DeleteItemResponse,
    }),
    CommonErrorResponses(),
  );
