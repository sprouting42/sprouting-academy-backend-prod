import { ApiProperty } from '@nestjs/swagger';

export class MemoryInfo {
  @ApiProperty({
    example: 45,
    description: 'Used memory in MB',
  })
  used: number;

  @ApiProperty({
    example: 128,
    description: 'Total allocated memory in MB',
  })
  total: number;
}
