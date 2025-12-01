import { ApiProperty } from '@nestjs/swagger';

export class AddItemResponse {
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
    example: 'Item added to cart successfully',
    description: 'Success message',
  })
  message: string;
}
