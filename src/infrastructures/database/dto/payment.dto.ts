import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional, IsString, IsUUID } from 'class-validator';

import { BaseDatabaseDto } from '@/infrastructures/database/abstracts/base.dto';

export class PaymentDto extends BaseDatabaseDto {
  @Expose()
  @IsString()
  @ApiProperty({
    description: 'Payment type (Credit Card, QR Code, Bank Transfer)',
  })
  paymentType: string;

  @Expose()
  @IsString()
  @ApiProperty({ description: 'Payment status' })
  status: string;

  @Expose()
  @IsOptional()
  @IsString()
  @IsUUID()
  @ApiPropertyOptional({ description: 'Order ID' })
  orderId?: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Payment slip image' })
  slipImage?: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Omise charge ID' })
  omiseChargeId?: string | null;

  @Expose()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Payment amount' })
  amount?: number;
}
