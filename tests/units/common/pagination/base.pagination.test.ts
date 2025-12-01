/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import 'reflect-metadata';

import { describe, expect, it } from 'vitest';

import { BasePagination } from '@/common/pagination/base.pagination';

// Concrete implementation for testing
class TestPagination extends BasePagination {
  constructor() {
    super();
  }
}

describe('base.pagination', () => {
  describe('BasePagination', () => {
    it('should be instantiable', () => {
      const pagination = new TestPagination();
      expect(pagination).toBeInstanceOf(BasePagination);
      expect(pagination).toBeDefined();
    });

    it('should have optional pageSize property', () => {
      const pagination = new TestPagination();
      pagination.pageSize = 20;

      expect(pagination.pageSize).toBe(20);
    });

    it('should have optional pageNumber property', () => {
      const pagination = new TestPagination();
      pagination.pageNumber = 5;

      expect(pagination.pageNumber).toBe(5);
    });

    it('should allow both properties to be set', () => {
      const pagination = new TestPagination();
      pagination.pageSize = 25;
      pagination.pageNumber = 3;

      expect(pagination.pageSize).toBe(25);
      expect(pagination.pageNumber).toBe(3);
    });

    it('should allow properties to be undefined', () => {
      const pagination = new TestPagination();

      expect(pagination.pageSize).toBeUndefined();
      expect(pagination.pageNumber).toBeUndefined();
    });

    it('should handle pageSize of 1', () => {
      const pagination = new TestPagination();
      pagination.pageSize = 1;

      expect(pagination.pageSize).toBe(1);
    });

    it('should handle large page numbers', () => {
      const pagination = new TestPagination();
      pagination.pageNumber = 999;

      expect(pagination.pageNumber).toBe(999);
    });

    it('should have ApiPropertyOptional decorator metadata for pageSize', () => {
      const metadata = Reflect.getMetadata(
        'swagger/apiModelProperties',
        BasePagination.prototype,
        'pageSize',
      );

      expect(metadata).toBeDefined();
      expect(metadata.description).toBe('Number of items per page');
      expect(metadata.example).toBe(10);
    });

    it('should have ApiPropertyOptional decorator metadata for pageNumber', () => {
      const metadata = Reflect.getMetadata(
        'swagger/apiModelProperties',
        BasePagination.prototype,
        'pageNumber',
      );

      expect(metadata).toBeDefined();
      expect(metadata.description).toBe('Page number (starting from 1)');
      expect(metadata.example).toBe(1);
    });

    it('should be abstract and extendable', () => {
      class CustomPagination extends BasePagination {
        customProperty = 'custom';
      }

      const custom = new CustomPagination();
      custom.pageSize = 50;
      custom.pageNumber = 1;

      expect(custom).toBeInstanceOf(BasePagination);
      expect(custom.pageSize).toBe(50);
      expect(custom.customProperty).toBe('custom');
    });
  });
});
