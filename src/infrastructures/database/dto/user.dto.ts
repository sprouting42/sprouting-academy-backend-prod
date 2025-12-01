import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

import { BaseDatabaseDto } from '@/infrastructures/database/abstracts/base.dto';
import { UserRole } from '@/infrastructures/database/enums/user-role';

export class UserDto extends BaseDatabaseDto {
  @Expose()
  @IsString()
  email: string;

  @ApiProperty()
  @Expose()
  @IsString()
  fullName: string;

  @IsOptional()
  @Expose()
  @IsString()
  phone?: string;

  @IsOptional()
  @Expose()
  @IsString()
  avatarUrl?: string;

  @Expose()
  @IsEnum(UserRole)
  role: UserRole;

  @IsBoolean()
  @Expose()
  isActive: boolean;
}
