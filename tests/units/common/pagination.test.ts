import { describe, expect, it } from 'vitest';

import {
  BasePagination,
  PaginationMeta,
  PaginationOutput,
} from '@/common/pagination';

describe('BasePagination', () => {
  class TestBasePagination extends BasePagination {}

  describe('constructor', () => {
    it('should create an instance', () => {
      const pagination = new TestBasePagination();

      expect(pagination).toBeInstanceOf(BasePagination);
      expect(pagination.pageSize).toBeUndefined();
      expect(pagination.pageNumber).toBeUndefined();
    });

    it('should allow setting pageSize', () => {
      const pagination = new TestBasePagination();
      pagination.pageSize = 20;

      expect(pagination.pageSize).toBe(20);
    });

    it('should allow setting pageNumber', () => {
      const pagination = new TestBasePagination();
      pagination.pageNumber = 3;

      expect(pagination.pageNumber).toBe(3);
    });
  });

  describe('properties', () => {
    it('should have optional pageSize property', () => {
      const pagination = new TestBasePagination();

      expect('pageSize' in pagination).toBe(true);
    });

    it('should have optional pageNumber property', () => {
      const pagination = new TestBasePagination();

      expect('pageNumber' in pagination).toBe(true);
    });
  });
});

describe('PaginationMeta', () => {
  describe('constructor', () => {
    it('should create instance with default values', () => {
      const meta = new PaginationMeta(100);

      expect(meta).toBeInstanceOf(PaginationMeta);
      expect(meta).toBeInstanceOf(BasePagination);
      expect(meta.totalCount).toBe(100);
      expect(meta.pageSize).toBe(10);
      expect(meta.currentPage).toBe(1);
      expect(meta.totalPages).toBe(10);
      expect(meta.hasNextPage).toBe(true);
      expect(meta.hasPrevPage).toBe(false);
    });

    it('should create instance with custom page number', () => {
      const meta = new PaginationMeta(100, 5);

      expect(meta.totalCount).toBe(100);
      expect(meta.currentPage).toBe(5);
      expect(meta.pageSize).toBe(10);
      expect(meta.totalPages).toBe(10);
      expect(meta.hasNextPage).toBe(true);
      expect(meta.hasPrevPage).toBe(true);
    });

    it('should create instance with custom page size', () => {
      const meta = new PaginationMeta(100, 1, 20);

      expect(meta.totalCount).toBe(100);
      expect(meta.currentPage).toBe(1);
      expect(meta.pageSize).toBe(20);
      expect(meta.totalPages).toBe(5);
      expect(meta.hasNextPage).toBe(true);
      expect(meta.hasPrevPage).toBe(false);
    });

    it('should calculate totalPages correctly', () => {
      const meta = new PaginationMeta(125, 1, 10);

      expect(meta.totalPages).toBe(13);
    });

    it('should handle edge case with zero items', () => {
      const meta = new PaginationMeta(0, 1, 10);

      expect(meta.totalCount).toBe(0);
      expect(meta.totalPages).toBe(0);
      expect(meta.hasNextPage).toBe(false);
      expect(meta.hasPrevPage).toBe(false);
    });

    it('should handle edge case with one item', () => {
      const meta = new PaginationMeta(1, 1, 10);

      expect(meta.totalCount).toBe(1);
      expect(meta.totalPages).toBe(1);
      expect(meta.hasNextPage).toBe(false);
      expect(meta.hasPrevPage).toBe(false);
    });
  });

  describe('hasNextPage', () => {
    it('should return true when not on last page', () => {
      const meta = new PaginationMeta(100, 5, 10);

      expect(meta.hasNextPage).toBe(true);
    });

    it('should return false when on last page', () => {
      const meta = new PaginationMeta(100, 10, 10);

      expect(meta.hasNextPage).toBe(false);
    });

    it('should return false when beyond last page', () => {
      const meta = new PaginationMeta(100, 15, 10);

      expect(meta.hasNextPage).toBe(false);
    });

    it('should return false with zero items', () => {
      const meta = new PaginationMeta(0, 1, 10);

      expect(meta.hasNextPage).toBe(false);
    });
  });

  describe('hasPrevPage', () => {
    it('should return false on first page', () => {
      const meta = new PaginationMeta(100, 1, 10);

      expect(meta.hasPrevPage).toBe(false);
    });

    it('should return true when not on first page', () => {
      const meta = new PaginationMeta(100, 2, 10);

      expect(meta.hasPrevPage).toBe(true);
    });

    it('should return true on last page', () => {
      const meta = new PaginationMeta(100, 10, 10);

      expect(meta.hasPrevPage).toBe(true);
    });
  });

  describe('static create', () => {
    it('should create instance with only totalCount', () => {
      const meta = PaginationMeta.create({ totalCount: 100 });

      expect(meta).toBeInstanceOf(PaginationMeta);
      expect(meta.totalCount).toBe(100);
      expect(meta.currentPage).toBe(1);
      expect(meta.pageSize).toBe(10);
    });

    it('should create instance with custom currentPage', () => {
      const meta = PaginationMeta.create({
        totalCount: 100,
        currentPage: 5,
      });

      expect(meta.totalCount).toBe(100);
      expect(meta.currentPage).toBe(5);
      expect(meta.pageSize).toBe(10);
    });

    it('should create instance with custom pageSize', () => {
      const meta = PaginationMeta.create({
        totalCount: 100,
        pageSize: 25,
      });

      expect(meta.totalCount).toBe(100);
      expect(meta.currentPage).toBe(1);
      expect(meta.pageSize).toBe(25);
      expect(meta.totalPages).toBe(4);
    });

    it('should create instance with all custom values', () => {
      const meta = PaginationMeta.create({
        totalCount: 125,
        currentPage: 3,
        pageSize: 20,
      });

      expect(meta.totalCount).toBe(125);
      expect(meta.currentPage).toBe(3);
      expect(meta.pageSize).toBe(20);
      expect(meta.totalPages).toBe(7);
      expect(meta.hasNextPage).toBe(true);
      expect(meta.hasPrevPage).toBe(true);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle typical first page scenario', () => {
      const meta = new PaginationMeta(125, 1, 10);

      expect(meta.totalCount).toBe(125);
      expect(meta.currentPage).toBe(1);
      expect(meta.totalPages).toBe(13);
      expect(meta.hasNextPage).toBe(true);
      expect(meta.hasPrevPage).toBe(false);
    });

    it('should handle typical middle page scenario', () => {
      const meta = new PaginationMeta(125, 7, 10);

      expect(meta.totalCount).toBe(125);
      expect(meta.currentPage).toBe(7);
      expect(meta.totalPages).toBe(13);
      expect(meta.hasNextPage).toBe(true);
      expect(meta.hasPrevPage).toBe(true);
    });

    it('should handle typical last page scenario', () => {
      const meta = new PaginationMeta(125, 13, 10);

      expect(meta.totalCount).toBe(125);
      expect(meta.currentPage).toBe(13);
      expect(meta.totalPages).toBe(13);
      expect(meta.hasNextPage).toBe(false);
      expect(meta.hasPrevPage).toBe(true);
    });

    it('should handle large dataset with custom page size', () => {
      const meta = new PaginationMeta(10000, 50, 100);

      expect(meta.totalCount).toBe(10000);
      expect(meta.currentPage).toBe(50);
      expect(meta.pageSize).toBe(100);
      expect(meta.totalPages).toBe(100);
      expect(meta.hasNextPage).toBe(true);
      expect(meta.hasPrevPage).toBe(true);
    });

    it('should handle single page result', () => {
      const meta = new PaginationMeta(5, 1, 10);

      expect(meta.totalCount).toBe(5);
      expect(meta.currentPage).toBe(1);
      expect(meta.totalPages).toBe(1);
      expect(meta.hasNextPage).toBe(false);
      expect(meta.hasPrevPage).toBe(false);
    });
  });
});

describe('PaginationOutput', () => {
  interface TestItem {
    id: number;
    name: string;
  }

  class TestPaginationOutput extends PaginationOutput<TestItem> {
    constructor(items: TestItem[], meta: PaginationMeta) {
      super();
      this.items = items;
      this.meta = meta;
    }
  }

  describe('constructor', () => {
    it('should create instance with items and meta', () => {
      const items: TestItem[] = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ];
      const meta = new PaginationMeta(10, 1, 5);
      const output = new TestPaginationOutput(items, meta);

      expect(output).toBeInstanceOf(PaginationOutput);
      expect(output.items).toEqual(items);
      expect(output.meta).toEqual(meta);
    });

    it('should handle empty items array', () => {
      const items: TestItem[] = [];
      const meta = new PaginationMeta(0, 1, 10);
      const output = new TestPaginationOutput(items, meta);

      expect(output.items).toEqual([]);
      expect(output.items.length).toBe(0);
      expect(output.meta.totalCount).toBe(0);
    });

    it('should handle single item', () => {
      const items: TestItem[] = [{ id: 1, name: 'Only Item' }];
      const meta = new PaginationMeta(1, 1, 10);
      const output = new TestPaginationOutput(items, meta);

      expect(output.items.length).toBe(1);
      expect(output.items[0]).toEqual({ id: 1, name: 'Only Item' });
    });
  });

  describe('properties', () => {
    it('should have items property', () => {
      const items: TestItem[] = [{ id: 1, name: 'Test' }];
      const meta = new PaginationMeta(10, 1, 10);
      const output = new TestPaginationOutput(items, meta);

      expect('items' in output).toBe(true);
      expect(Array.isArray(output.items)).toBe(true);
    });

    it('should have meta property', () => {
      const items: TestItem[] = [{ id: 1, name: 'Test' }];
      const meta = new PaginationMeta(10, 1, 10);
      const output = new TestPaginationOutput(items, meta);

      expect('meta' in output).toBe(true);
      expect(output.meta).toBeInstanceOf(PaginationMeta);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle user list pagination', () => {
      const users: TestItem[] = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
      ];
      const meta = new PaginationMeta(50, 1, 3);
      const output = new TestPaginationOutput(users, meta);

      expect(output.items.length).toBe(3);
      expect(output.meta.totalCount).toBe(50);
      expect(output.meta.currentPage).toBe(1);
      expect(output.meta.hasNextPage).toBe(true);
    });

    it('should handle last page with partial items', () => {
      const items: TestItem[] = [
        { id: 96, name: 'Item 96' },
        { id: 97, name: 'Item 97' },
        { id: 98, name: 'Item 98' },
        { id: 99, name: 'Item 99' },
        { id: 100, name: 'Item 100' },
      ];
      const meta = new PaginationMeta(100, 10, 10);
      const output = new TestPaginationOutput(items, meta);

      expect(output.items.length).toBe(5);
      expect(output.meta.totalCount).toBe(100);
      expect(output.meta.currentPage).toBe(10);
      expect(output.meta.hasNextPage).toBe(false);
      expect(output.meta.hasPrevPage).toBe(true);
    });

    it('should handle middle page scenario', () => {
      const items: TestItem[] = Array.from({ length: 10 }, (_, i) => ({
        id: i + 51,
        name: `Item ${i + 51}`,
      }));
      const meta = new PaginationMeta(125, 6, 10);
      const output = new TestPaginationOutput(items, meta);

      expect(output.items.length).toBe(10);
      expect(output.meta.totalCount).toBe(125);
      expect(output.meta.currentPage).toBe(6);
      expect(output.meta.totalPages).toBe(13);
      expect(output.meta.hasNextPage).toBe(true);
      expect(output.meta.hasPrevPage).toBe(true);
    });
  });

  describe('generic type handling', () => {
    interface Product {
      id: string;
      title: string;
      price: number;
    }

    class ProductPaginationOutput extends PaginationOutput<Product> {}

    it('should work with different generic types', () => {
      const products: Product[] = [
        { id: 'abc', title: 'Product 1', price: 99.99 },
        { id: 'def', title: 'Product 2', price: 149.99 },
      ];
      const meta = new PaginationMeta(20, 2, 10);
      const output = new ProductPaginationOutput();
      output.items = products;
      output.meta = meta;

      expect(output.items).toEqual(products);
      expect(output.items[0]?.price).toBe(99.99);
      expect(output.meta.currentPage).toBe(2);
    });
  });

  describe('ApiProperty decorator type functions', () => {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment */
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    /* eslint-disable @typescript-eslint/no-unsafe-call */
    it('should have type metadata for items property', () => {
      const metadata = Reflect.getMetadata(
        'swagger/apiModelProperties',
        PaginationOutput.prototype,
        'items',
      );

      expect(metadata).toBeDefined();
      if (typeof metadata?.type === 'function') {
        const typeResult = metadata.type();
        expect(typeResult).toBeDefined();
      }
    });

    it('should have type metadata for meta property', () => {
      const metadata = Reflect.getMetadata(
        'swagger/apiModelProperties',
        PaginationOutput.prototype,
        'meta',
      );

      expect(metadata).toBeDefined();
      if (typeof metadata?.type === 'function') {
        const typeResult = metadata.type();
        expect(typeResult).toBe(PaginationMeta);
      }
    });
    /* eslint-enable @typescript-eslint/no-unsafe-assignment */
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */
    /* eslint-enable @typescript-eslint/no-unsafe-call */
  });
});
