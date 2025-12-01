import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsUUID, ValidateNested } from 'class-validator';

export class OrderItemRequest {
  @IsUUID()
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Course ID',
  })
  courseId: string;
}

export class CreateOrderRequestBody {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemRequest)
  @ApiProperty({
    type: [OrderItemRequest],
    description: 'List of courses to order',
    example: [
      { courseId: '550e8400-e29b-41d4-a716-446655440000' },
      { courseId: '550e8400-e29b-41d4-a716-446655440001' },
    ],
  })
  items: OrderItemRequest[];

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Coupon ID (optional)',
  })
  couponId?: string;
}
