import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentResponse {
  @ApiProperty({ description: 'Payment ID' })
  id: string;

  @ApiProperty({ description: 'Payment type' })
  paymentType: string;

  @ApiProperty({
    description: 'Payment status (pending, successful, rejected)',
  })
  status: string;

  @ApiPropertyOptional({ description: 'Order ID' })
  orderId: string | null;

  @ApiPropertyOptional({ description: 'Omise charge ID' })
  omiseChargeId: string | null;

  @ApiPropertyOptional({ description: 'Payment slip image URL' })
  slipImage: string | null;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}
