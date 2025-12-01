import { ApiProperty } from '@nestjs/swagger';

export class OtpSentResponse {
  @ApiProperty({
    example: 'OTP sent to your email',
    description: 'Success message',
  })
  message: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address where OTP was sent',
  })
  email: string;
}
