import { ApiProperty } from '@nestjs/swagger';

class CartItemDetail {
  @ApiProperty({
    example: 'd1b1c430-7161-4f5d-a91c-2d318f1f4473',
    description: 'Cart item ID',
  })
  id: string;

  @ApiProperty({
    example: 'd1b1c430-7161-4f5d-a91c-2d318f1f4473',
    description: 'Course ID',
  })
  courseId: string;

  @ApiProperty({
    example: 'Introduction to Programming',
    description: 'Course title',
  })
  courseTitle: string;

  @ApiProperty({
    example: '2025-12-08T09:00:00.000Z',
    description: 'Course start date',
    required: false,
    nullable: true,
  })
  courseDate?: Date | null;

  @ApiProperty({
    example: 1999.99,
    description: 'Course price',
  })
  price: number;

  @ApiProperty({
    example: 'online',
    description: 'Class type',
    required: false,
    nullable: true,
  })
  classType?: string | null;

  @ApiProperty({
    example: 10,
    description: 'Total times course (hours)',
    required: false,
    nullable: true,
  })
  totalTimesCourse?: number | null;

  @ApiProperty({
    example: 5,
    description: 'Total class count',
    required: false,
    nullable: true,
  })
  totalClass?: number | null;
}

export class CartResponse {
  @ApiProperty({
    example: 'd1b1c430-7161-4f5d-a91c-2d318f1f4473',
    description: 'Cart ID',
  })
  id: string;

  @ApiProperty({
    type: [CartItemDetail],
    description: 'List of items in cart',
  })
  items: CartItemDetail[];

  @ApiProperty({
    example: 4999.98,
    description: 'Total price of all items',
  })
  totalPrice: number;

  @ApiProperty({
    example: 2,
    description: 'Total number of items',
  })
  itemCount: number;
}
