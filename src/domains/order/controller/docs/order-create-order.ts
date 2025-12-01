import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiDocCreateOrder() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create order',
      description:
        'Create a new order with multiple courses. Optionally apply a coupon for discount. Returns order details with calculated subtotal and total amounts.',
    }),
  );
}
