import type { SortOrder } from '@/enums/pagination.enum';

export class PaginationArgs {
  pageNumber?: number = 1;
  pageSize?: number = 10;

  constructor(init?: Partial<PaginationArgs>) {
    Object.assign(this, init);
  }
}

export class FindManyArgs {
  where?: Record<string, never> = {};
  orderBy?: Record<string, SortOrder> = {};

  constructor(init?: Partial<FindManyArgs>) {
    Object.assign(this, init);
  }
}

export class FindManyPaginatedArgs extends FindManyArgs {
  pagination?: PaginationArgs = new PaginationArgs();

  constructor(init?: Partial<FindManyPaginatedArgs>) {
    super(init);
    if (init?.pagination) {
      this.pagination = new PaginationArgs(init.pagination);
    }
  }
}

export class PaginatedResult<T> {
  items: T[] = [];
  totalCount: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;

  private constructor(data: Partial<PaginatedResult<T>>) {
    Object.assign(this, data);
  }

  static create<T>(
    items: T[],
    totalCount = 0,
    currentPage = 1,
    pageSize = 10,
  ): PaginatedResult<T> {
    return new PaginatedResult<T>({
      items,
      totalCount,
      currentPage,
      pageSize,
    });
  }
}
