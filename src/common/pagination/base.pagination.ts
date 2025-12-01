import { ApiPropertyOptional } from '@nestjs/swagger';

export abstract class BasePagination {
  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
  })
  pageSize?: number;

  @ApiPropertyOptional({
    description: 'Page number (starting from 1)',
    example: 1,
  })
  pageNumber?: number;
}
