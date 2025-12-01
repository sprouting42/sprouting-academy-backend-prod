import { ApiProperty } from '@nestjs/swagger';

import { UserProfileResponse } from '@/domains/auth/controller/contracts/user-profile.reponse';

export class VerifyOtpResponse {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ',
    description: 'JWT access token for authentication',
  })
  accessToken: string;

  @ApiProperty({
    example: 'bearer',
    description: 'Token type',
  })
  tokenType: string;

  @ApiProperty({
    example: 3600,
    description: 'Token expiration time in seconds',
  })
  expiresIn: number;

  @ApiProperty({
    example: '2025-01-15T12:34:56.000Z',
    description: 'Timestamp when the token expires',
  })
  expiresAt: number;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token for obtaining new access tokens',
  })
  refreshToken: string;

  @ApiProperty({
    type: UserProfileResponse,
    description: 'User profile information',
  })
  user: UserProfileResponse;
}
