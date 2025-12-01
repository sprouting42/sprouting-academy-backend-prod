import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { UserRole } from '@/infrastructures/database/enums/user-role';

export class UserProfileResponse {
  @ApiProperty({
    description: 'Unique identifier of the user (UUID format)',
    format: 'uuid',
    example: 'd1b1c430-7161-4f5d-a91c-2d318f1f4473',
  })
  id: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'khawfang@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'Khawfang Phromchat',
  })
  fullName: string;

  @ApiProperty({
    description: 'Phone number of the user (nullable)',
    nullable: true,
    required: false,
    example: '0891234567',
  })
  @Expose()
  phone: string | null;

  @ApiProperty({
    description: 'URL of the user avatar image (nullable)',
    nullable: true,
    required: false,
    example: 'https://cdn.example.com/avatar/123.jpg',
  })
  avatarUrl: string | null;

  @ApiProperty({
    description: 'Role assigned to the user',
    enum: UserRole,
    example: UserRole.STUDENT,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Indicates whether the user account is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Date and time when the user was created',
    example: '2025-01-15T12:34:56.000Z',
  })
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({
    description: 'Date and time when the user was last updated',
    required: false,
    example: '2025-01-20T12:00:00.000Z',
  })
  @Type(() => Date)
  updatedAt: Date;
}
