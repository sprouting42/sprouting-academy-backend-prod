import { ApiProperty } from '@nestjs/swagger';

import { BasePagination } from '@/common/pagination/base.pagination';

export class PaginationMeta extends BasePagination {
  @ApiProperty({
    description: 'Total number of items',
    example: 125,
  })
  totalCount: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 13,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  currentPage: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true,
  })
  hasNextPage: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPrevPage: boolean;

  constructor(totalCount: number, pageNumber = 1, pageSize = 10) {
    super();
    this.totalCount = totalCount;
    this.pageSize = pageSize;
    this.currentPage = pageNumber;
    this.totalPages = Math.ceil(totalCount / pageSize);
    this.hasNextPage = pageNumber < this.totalPages;
    this.hasPrevPage = pageNumber > 1;
  }

  static create({
    totalCount,
    currentPage = 1,
    pageSize = 10,
  }: {
    totalCount: number;
    currentPage?: number;
    pageSize?: number;
  }): PaginationMeta {
    return new PaginationMeta(totalCount, currentPage, pageSize);
  }
}
