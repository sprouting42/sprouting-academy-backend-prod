import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNumber, IsString, IsUUID } from 'class-validator';

import { BaseDatabaseDto } from '@/infrastructures/database/abstracts/base.dto';

export class OrderItemDto extends BaseDatabaseDto {
  @Expose()
  @IsString()
  @IsUUID()
  @ApiProperty({ description: 'Course ID' })
  courseId: string;

  @Expose()
  @IsString()
  @IsUUID()
  @ApiProperty({ description: 'Order ID' })
  orderId: string;

  @Expose()
  @IsNumber()
  @ApiProperty({ description: 'Unit price' })
  unitPrice: number;
}
