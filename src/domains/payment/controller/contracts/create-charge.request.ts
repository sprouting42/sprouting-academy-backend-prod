import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  Max,
  Length,
  Matches,
} from 'class-validator';

export class CreateChargeRequestBody {
  @IsUUID()
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Order ID',
  })
  orderId: string;

  @IsString()
  @Length(13, 19)
  @Matches(/^\d+$/, {
    message: 'Card number must contain only digits',
  })
  @ApiProperty({
    example: '4242424242424242',
    description: 'Card number (13-19 digits)',
  })
  cardNumber: string;

  @IsString()
  @Length(1, 100)
  @ApiProperty({
    example: 'John Doe',
    description: 'Cardholder name',
  })
  cardName: string;

  @IsNumber()
  @Min(1)
  @Max(12)
  @ApiProperty({
    example: 12,
    description: 'Expiry month (1-12)',
    minimum: 1,
    maximum: 12,
  })
  expirationMonth: number;

  @IsNumber()
  @Min(2020)
  @Max(2100)
  @ApiProperty({
    example: 2025,
    description: 'Expiry year (4 digits)',
    minimum: 2020,
    maximum: 2100,
  })
  expirationYear: number;

  @IsString()
  @Length(3, 4)
  @Matches(/^\d+$/, {
    message: 'CVV must contain only digits',
  })
  @ApiProperty({
    example: '123',
    description: 'CVV/CVC security code (3-4 digits)',
  })
  securityCode: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'Bangkok',
    description: 'City (optional)',
  })
  city?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: '10110',
    description: 'Postal code (optional)',
  })
  postalCode?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'Payment for course enrollment',
    description: 'Optional charge description',
  })
  description?: string;
}
