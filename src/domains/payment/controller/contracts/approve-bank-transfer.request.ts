import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, ValidateIf } from 'class-validator';

export class ApproveBankTransferRequestBody {
  @IsBoolean()
  @ApiProperty({
    example: true,
    description: 'Approve or reject the payment',
  })
  approved: boolean;

  @IsOptional()
  @IsString()
  @ValidateIf((o: ApproveBankTransferRequestBody) => o.approved === false)
  @ApiPropertyOptional({
    example: 'Invalid payment slip',
    description: 'Reason for rejection (required if approved = false)',
  })
  reason?: string;
}
