import { ApiProperty } from '@nestjs/swagger';

import { OrderItemResponse } from './order-item.response';

export class BaseOrderResponse {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Order ID',
  })
  id: string;

  @ApiProperty({
    example: 2000,
    description: 'Subtotal amount (before discount)',
  })
  subtotalAmount: number;

  @ApiProperty({
    example: 1800,
    description: 'Total amount (after discount)',
  })
  totalAmount: number;

  @ApiProperty({
    example: 'pending',
    description: 'Order status',
  })
  orderStatus: string;

  @ApiProperty({
    type: [OrderItemResponse],
    description: 'Order items',
  })
  items: OrderItemResponse[];

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Coupon ID (if applied)',
    nullable: true,
  })
  couponId: string | null;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Created at',
  })
  createdAt: Date;
}
