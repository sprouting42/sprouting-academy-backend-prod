import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorDetail {
  @ApiProperty({
    description: 'Human-readable message describing the error',
  })
  message: string;

  @ApiPropertyOptional({
    example: 'VALIDATION_ERROR',
    description: 'Optional machine-readable error code',
  })
  code?: string;

  @ApiPropertyOptional({
    description: 'Detailed validation errors (if applicable)',
    type: 'object',
    additionalProperties: { type: 'array', items: { type: 'string' } },
  })
  validationErrors?: Record<string, string[]>;
}

export class ErrorDebug extends ErrorDetail {
  @ApiPropertyOptional({
    description: 'The source or method where the error originated',
  })
  debugSource?: string;

  @ApiPropertyOptional({
    description: 'Additional developer-facing debug information',
  })
  debugInfo?: string;
}
