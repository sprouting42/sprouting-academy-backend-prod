import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RetrieveChargeRequestParams {
  @IsString()
  @ApiProperty({
    example: 'chrg_test_1234567890',
    description: 'Omise charge ID',
  })
  chargeId: string;
}
