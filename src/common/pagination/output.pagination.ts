import { ApiProperty } from '@nestjs/swagger';

import { PaginationMeta } from '@/common/pagination/meta.pagination';

export abstract class PaginationOutput<TItem> {
  @ApiProperty({
    description: 'List of items on the current page',
    isArray: true,
    type: () => Object as TItem,
  })
  items: TItem[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: () => PaginationMeta,
  })
  meta: PaginationMeta;
}
