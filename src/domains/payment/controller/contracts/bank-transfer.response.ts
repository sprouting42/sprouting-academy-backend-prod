import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BankTransferResponse {
  @ApiProperty({ description: 'Payment ID' })
  id: string;

  @ApiPropertyOptional({ description: 'Enrollment ID' })
  enrollmentId: string | null;

  @ApiProperty({ description: 'Payment type' })
  paymentType: string;

  @ApiProperty({ description: 'Payment amount' })
  amount: number;

  @ApiProperty({
    description: 'Payment status (pending, successful, rejected)',
  })
  status: string;

  @ApiProperty({ description: 'Payment slip image URL' })
  slipImage: string;

  @ApiPropertyOptional({ description: 'Coupon ID' })
  couponId?: string | null;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}
