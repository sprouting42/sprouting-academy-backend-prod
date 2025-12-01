import { describe, expect, it } from 'vitest';

import { BasePagination } from '@/common/pagination/base.pagination';
import * as PaginationExports from '@/common/pagination/index';
import { PaginationMeta } from '@/common/pagination/meta.pagination';
import { PaginationOutput } from '@/common/pagination/output.pagination';

describe('pagination index', () => {
  it('should export BasePagination', () => {
    expect(PaginationExports.BasePagination).toBe(BasePagination);
  });

  it('should export PaginationMeta', () => {
    expect(PaginationExports.PaginationMeta).toBe(PaginationMeta);
  });

  it('should export PaginationOutput', () => {
    expect(PaginationExports.PaginationOutput).toBe(PaginationOutput);
  });

  it('should have all expected exports', () => {
    expect(PaginationExports).toHaveProperty('BasePagination');
    expect(PaginationExports).toHaveProperty('PaginationMeta');
    expect(PaginationExports).toHaveProperty('PaginationOutput');
  });

  it('should export constructors that can be instantiated', () => {
    class TestPagination extends PaginationExports.BasePagination {}
    const basePagination = new TestPagination();
    expect(basePagination).toBeInstanceOf(PaginationExports.BasePagination);

    const meta = new PaginationExports.PaginationMeta(10, 1, 10);
    expect(meta).toBeInstanceOf(PaginationExports.PaginationMeta);

    class TestOutput extends PaginationExports.PaginationOutput<{
      id: string;
    }> {}
    const output = new TestOutput();
    expect(output).toBeInstanceOf(PaginationExports.PaginationOutput);
  });

  it('should export working classes', () => {
    const meta = PaginationExports.PaginationMeta.create({
      totalCount: 100,
      currentPage: 1,
      pageSize: 10,
    });

    expect(meta.totalCount).toBe(100);
    expect(meta.totalPages).toBe(10);
    expect(meta.hasNextPage).toBe(true);
  });
});
