import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional, IsString, IsUUID } from 'class-validator';

import { BaseDatabaseDto } from '@/infrastructures/database/abstracts/base.dto';

export class EnrollmentDto extends BaseDatabaseDto {
  @Expose()
  @IsString()
  @IsUUID()
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @Expose()
  @IsString()
  @IsUUID()
  @ApiProperty({ description: 'Course ID' })
  courseId: string;

  @Expose()
  @IsOptional()
  @IsString()
  @IsUUID()
  @ApiPropertyOptional({ description: 'Payment ID (null if not paid yet)' })
  paymentId?: string | null;
}
