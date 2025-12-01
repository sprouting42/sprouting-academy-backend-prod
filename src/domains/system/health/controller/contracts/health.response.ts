import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { MemoryInfo } from '@/domains/system/health/controller/contracts/health-memory';

export class HealthResponse {
  @ApiProperty({
    example: '200',
    description: 'The current health status of the application',
  })
  status: string;

  @ApiProperty({
    example: '2025-09-23T04:40:12.000Z',
    description: 'The timestamp when the health check was performed',
  })
  timestamp: string;

  @ApiProperty({
    example: 12345,
    description: 'The uptime of the application in seconds',
  })
  uptime: number;

  @ApiPropertyOptional({
    example: '1.0.0',
    description: 'Application version',
  })
  version?: string;

  @ApiPropertyOptional({
    example: 'production',
    description: 'Current environment',
  })
  environment?: string;

  @ApiPropertyOptional({
    type: MemoryInfo,
    description: 'Memory usage information',
  })
  memory?: MemoryInfo;

  private constructor(partial: Partial<HealthResponse>) {
    Object.assign(this, partial);
  }

  public static create(partial: Partial<HealthResponse>): HealthResponse {
    return new HealthResponse(partial);
  }
}
