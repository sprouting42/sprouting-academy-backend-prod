import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

import { BaseDatabaseDto } from '@/infrastructures/database/abstracts/base.dto';

export class OrderDto extends BaseDatabaseDto {
  @Expose()
  @IsNumber()
  @ApiProperty({ description: 'Subtotal amount (before discount)' })
  subtotalAmount: number;

  @Expose()
  @IsNumber()
  @ApiProperty({ description: 'Total amount (after discount)' })
  totalAmount: number;

  @Expose()
  @IsString()
  @ApiProperty({ description: 'Order status' })
  orderStatus: string;

  @Expose()
  @IsOptional()
  @IsString()
  @IsUUID()
  @ApiPropertyOptional({ description: 'Coupon ID (null if no coupon applied)' })
  couponId?: string | null;

  @Expose()
  @IsString()
  @IsUUID()
  @ApiProperty({ description: 'User ID' })
  userId: string;
}
