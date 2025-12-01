import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Base Charge Response
 * Common fields shared across all charge-related responses
 */
export class BaseChargeResponse {
  @ApiProperty({ description: 'Payment ID' })
  id: string;

  @ApiPropertyOptional({ description: 'Enrollment ID' })
  enrollmentId?: string | null;

  @ApiProperty({ description: 'Omise charge ID' })
  omiseChargeId: string;

  @ApiProperty({ description: 'Payment amount' })
  amount: number;

  @ApiProperty({ description: 'Currency code', default: 'thb' })
  currency: string;

  @ApiProperty({ description: 'Payment status' })
  status: string;

  @ApiProperty({ description: 'Payment method', default: 'Credit Card' })
  paymentMethod: string;

  @ApiPropertyOptional({ description: 'Failure code' })
  failureCode?: string | null;

  @ApiPropertyOptional({ description: 'Failure message' })
  failureMessage?: string | null;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}
