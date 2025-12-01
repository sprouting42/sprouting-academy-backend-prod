import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class AddItemRequestBody {
  @IsString()
  @IsUUID()
  @ApiProperty({
    example: 'd1b1c430-7161-4f5d-a91c-2d318f1f4473',
    description: 'Course ID to add to cart',
  })
  courseId: string;
}
