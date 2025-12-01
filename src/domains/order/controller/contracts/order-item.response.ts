import { ApiProperty } from '@nestjs/swagger';

export class OrderItemResponse {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Order item ID',
  })
  id: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Course ID',
  })
  courseId: string;

  @ApiProperty({
    example: 1000,
    description: 'Unit price',
  })
  unitPrice: number;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Created at',
  })
  createdAt: Date;
}
