import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEnrollmentResponse {
  @ApiProperty({ description: 'Enrollment ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Course name' })
  course: string;

  @ApiProperty({ description: 'Course price' })
  coursePrice: number;

  @ApiPropertyOptional({ description: 'Payment ID (null if not paid yet)' })
  paymentId: string | null;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}
