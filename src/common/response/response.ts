import { HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ErrorDebug, ErrorDetail } from '@/common/errors/error-info';

export class Response {
  @ApiProperty({
    description: 'Unique NanoID used for tracing this response across systems',
    type: String,
  })
  correlationId?: string;

  @ApiProperty({
    description: 'Timestamp when the response was generated (ISO 8601 format)',
  })
  responseDate?: string;

  @ApiProperty({
    description: 'HTTP status code of the response',
    enum: HttpStatus,
  })
  statusCode: HttpStatus;

  @ApiProperty({
    description: 'Readable HTTP status text corresponding to the status code',
  })
  status: string;

  @ApiProperty({
    description: 'Indicates whether the request was successful',
  })
  isSuccessful: boolean = false;

  @ApiPropertyOptional({
    description: 'Error message if the request failed',
  })
  errorMessage?: string;

  @ApiPropertyOptional({
    description:
      'Additional error details (only present in development/debug mode)',
    type: () => ErrorDetail,
  })
  errorDetails?: ErrorDetail | ErrorDebug;

  constructor(init?: Partial<Response>) {
    Object.assign(this, init);
  }

  static create(data?: Partial<Response>): Response {
    return new Response(data);
  }
}
