import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class SignInWithOtpRequestBody {
  @IsEmail()
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address for OTP authentication',
  })
  email: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  @ApiProperty({
    required: false,
    example: 'John Doe',
    description:
      'Full name (required for first-time sign up, optional for sign in)',
  })
  fullName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  @ApiProperty({
    required: false,
    example: '0812345678',
    description: 'Phone number (optional)',
  })
  phone?: string;
}
