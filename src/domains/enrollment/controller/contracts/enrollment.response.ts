import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EnrollmentResponse {
  @ApiProperty({ description: 'Enrollment ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Course name' })
  course: string;

  @ApiPropertyOptional({ description: 'Payment ID (null if not paid yet)' })
  paymentId: string | null;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}
