import { ApiProperty } from '@nestjs/swagger';

export class DeleteItemResponse {
  @ApiProperty({
    example: 'Item removed from cart successfully',
    description: 'Success message',
  })
  message: string;
}
