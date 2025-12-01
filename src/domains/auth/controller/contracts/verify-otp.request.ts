import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyOtpRequestBody {
  @IsEmail()
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address to verify OTP',
  })
  email: string;

  @IsString()
  @Length(6, 6)
  @ApiProperty({
    example: '123456',
    description: 'The 6-digit OTP code sent to email',
    minLength: 6,
    maxLength: 6,
  })
  otp: string;
}
