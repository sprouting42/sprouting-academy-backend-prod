/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import 'reflect-metadata';

import { describe, expect, it } from 'vitest';

import { PaginationMeta } from '@/common/pagination/meta.pagination';
import { PaginationOutput } from '@/common/pagination/output.pagination';

// Test DTO
class TestItemDto {
  id: string;
  name: string;
}

// Concrete implementation for testing
class TestPaginationOutput extends PaginationOutput<TestItemDto> {
  constructor(items: TestItemDto[], meta: PaginationMeta) {
    super();
    this.items = items;
    this.meta = meta;
  }
}

describe('output.pagination', () => {
  describe('PaginationOutput', () => {
    it('should be instantiable with items and meta', () => {
      const items = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];
      const meta = new PaginationMeta(10, 1, 10);
      const output = new TestPaginationOutput(items, meta);

      expect(output).toBeInstanceOf(PaginationOutput);
      expect(output.items).toBe(items);
      expect(output.meta).toBe(meta);
    });

    it('should contain items array', () => {
      const items = [
        { id: '1', name: 'Test 1' },
        { id: '2', name: 'Test 2' },
        { id: '3', name: 'Test 3' },
      ];
      const meta = new PaginationMeta(3, 1, 10);
      const output = new TestPaginationOutput(items, meta);

      expect(output.items).toHaveLength(3);
      expect(output.items[0]?.id).toBe('1');
      expect(output.items[1]?.name).toBe('Test 2');
    });

    it('should contain pagination meta', () => {
      const items = [{ id: '1', name: 'Item' }];
      const meta = new PaginationMeta(100, 5, 10);
      const output = new TestPaginationOutput(items, meta);

      expect(output.meta).toBeInstanceOf(PaginationMeta);
      expect(output.meta.totalCount).toBe(100);
      expect(output.meta.currentPage).toBe(5);
      expect(output.meta.pageSize).toBe(10);
    });

    it('should handle empty items array', () => {
      const items: TestItemDto[] = [];
      const meta = new PaginationMeta(0, 1, 10);
      const output = new TestPaginationOutput(items, meta);

      expect(output.items).toHaveLength(0);
      expect(output.meta.totalCount).toBe(0);
    });

    it('should handle different item types', () => {
      class CustomItem {
        value: number;
      }

      class CustomOutput extends PaginationOutput<CustomItem> {
        constructor(items: CustomItem[], meta: PaginationMeta) {
          super();
          this.items = items;
          this.meta = meta;
        }
      }

      const items = [{ value: 1 }, { value: 2 }];
      const meta = new PaginationMeta(2, 1, 10);
      const output = new CustomOutput(items, meta);

      expect(output.items).toHaveLength(2);
      expect(output.items[0]?.value).toBe(1);
    });

    it('should work with single item', () => {
      const items = [{ id: '1', name: 'Single Item' }];
      const meta = new PaginationMeta(1, 1, 10);
      const output = new TestPaginationOutput(items, meta);

      expect(output.items).toHaveLength(1);
      expect(output.items[0]?.id).toBe('1');
      expect(output.meta.totalPages).toBe(1);
    });

    it('should maintain reference to original items', () => {
      const items = [{ id: '1', name: 'Item' }];
      const meta = new PaginationMeta(1, 1, 10);
      const output = new TestPaginationOutput(items, meta);

      const firstItem = items[0];
      if (firstItem) {
        firstItem.name = 'Updated';
        expect(output.items[0]?.name).toBe('Updated');
      }
    });

    it('should maintain reference to original meta', () => {
      const items = [{ id: '1', name: 'Item' }];
      const meta = new PaginationMeta(100, 1, 10);
      const output = new TestPaginationOutput(items, meta);

      expect(output.meta).toBe(meta);
      expect(output.meta.totalCount).toBe(100);
    });

    describe('decorator metadata', () => {
      it('should have ApiProperty decorator for items', () => {
        const metadata = Reflect.getMetadata(
          'swagger/apiModelProperties',
          PaginationOutput.prototype,
          'items',
        );

        expect(metadata).toBeDefined();
        expect(metadata.description).toBe('List of items on the current page');
        expect(metadata.isArray).toBe(true);
      });

      it('should have ApiProperty decorator for meta', () => {
        const metadata = Reflect.getMetadata(
          'swagger/apiModelProperties',
          PaginationOutput.prototype,
          'meta',
        );

        expect(metadata).toBeDefined();
        expect(metadata.description).toBe('Pagination metadata');
      });
    });

    it('should be abstract and extendable', () => {
      class ExtendedOutput extends PaginationOutput<TestItemDto> {
        customField = 'custom';

        constructor(items: TestItemDto[], meta: PaginationMeta) {
          super();
          this.items = items;
          this.meta = meta;
        }
      }

      const items = [{ id: '1', name: 'Item' }];
      const meta = new PaginationMeta(1, 1, 10);
      const output = new ExtendedOutput(items, meta);

      expect(output).toBeInstanceOf(PaginationOutput);
      expect(output.customField).toBe('custom');
      expect(output.items).toHaveLength(1);
    });
  });
});
