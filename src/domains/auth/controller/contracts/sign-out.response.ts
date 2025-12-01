import { ApiProperty } from '@nestjs/swagger';

export class SignOutResponse {
  @ApiProperty({
    example: 'Successfully signed out',
    description: 'Success message',
  })
  message: string;
}
