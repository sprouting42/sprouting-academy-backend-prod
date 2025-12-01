/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import 'reflect-metadata';

import { describe, expect, it } from 'vitest';

import { PaginationMeta } from '@/common/pagination/meta.pagination';

describe('meta.pagination', () => {
  describe('PaginationMeta', () => {
    it('should create instance with default values', () => {
      const meta = new PaginationMeta(100);

      expect(meta.totalCount).toBe(100);
      expect(meta.currentPage).toBe(1);
      expect(meta.pageSize).toBe(10);
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
      const meta = new PaginationMeta(100, 1, 25);

      expect(meta.totalCount).toBe(100);
      expect(meta.currentPage).toBe(1);
      expect(meta.pageSize).toBe(25);
      expect(meta.totalPages).toBe(4);
      expect(meta.hasNextPage).toBe(true);
      expect(meta.hasPrevPage).toBe(false);
    });

    it('should calculate totalPages correctly', () => {
      const meta1 = new PaginationMeta(100, 1, 10);
      expect(meta1.totalPages).toBe(10);

      const meta2 = new PaginationMeta(95, 1, 10);
      expect(meta2.totalPages).toBe(10);

      const meta3 = new PaginationMeta(101, 1, 10);
      expect(meta3.totalPages).toBe(11);
    });

    it('should set hasNextPage to false on last page', () => {
      const meta = new PaginationMeta(100, 10, 10);

      expect(meta.hasNextPage).toBe(false);
      expect(meta.hasPrevPage).toBe(true);
    });

    it('should set hasPrevPage to false on first page', () => {
      const meta = new PaginationMeta(100, 1, 10);

      expect(meta.hasPrevPage).toBe(false);
      expect(meta.hasNextPage).toBe(true);
    });

    it('should handle single page scenario', () => {
      const meta = new PaginationMeta(5, 1, 10);

      expect(meta.totalPages).toBe(1);
      expect(meta.hasNextPage).toBe(false);
      expect(meta.hasPrevPage).toBe(false);
    });

    it('should handle empty results', () => {
      const meta = new PaginationMeta(0, 1, 10);

      expect(meta.totalCount).toBe(0);
      expect(meta.totalPages).toBe(0);
      expect(meta.hasNextPage).toBe(false);
      expect(meta.hasPrevPage).toBe(false);
    });

    it('should handle middle page correctly', () => {
      const meta = new PaginationMeta(100, 5, 10);

      expect(meta.currentPage).toBe(5);
      expect(meta.totalPages).toBe(10);
      expect(meta.hasNextPage).toBe(true);
      expect(meta.hasPrevPage).toBe(true);
    });

    it('should handle large page size', () => {
      const meta = new PaginationMeta(100, 1, 100);

      expect(meta.totalPages).toBe(1);
      expect(meta.hasNextPage).toBe(false);
      expect(meta.hasPrevPage).toBe(false);
    });

    it('should handle page size of 1', () => {
      const meta = new PaginationMeta(10, 5, 1);

      expect(meta.totalPages).toBe(10);
      expect(meta.currentPage).toBe(5);
      expect(meta.hasNextPage).toBe(true);
      expect(meta.hasPrevPage).toBe(true);
    });

    describe('create static method', () => {
      it('should create instance with default values', () => {
        const meta = PaginationMeta.create({ totalCount: 50 });

        expect(meta.totalCount).toBe(50);
        expect(meta.currentPage).toBe(1);
        expect(meta.pageSize).toBe(10);
        expect(meta.totalPages).toBe(5);
      });

      it('should create instance with custom currentPage', () => {
        const meta = PaginationMeta.create({
          totalCount: 50,
          currentPage: 3,
        });

        expect(meta.currentPage).toBe(3);
        expect(meta.totalCount).toBe(50);
      });

      it('should create instance with custom pageSize', () => {
        const meta = PaginationMeta.create({
          totalCount: 50,
          pageSize: 20,
        });

        expect(meta.pageSize).toBe(20);
        expect(meta.totalPages).toBe(3);
      });

      it('should create instance with all custom values', () => {
        const meta = PaginationMeta.create({
          totalCount: 100,
          currentPage: 2,
          pageSize: 25,
        });

        expect(meta.totalCount).toBe(100);
        expect(meta.currentPage).toBe(2);
        expect(meta.pageSize).toBe(25);
        expect(meta.totalPages).toBe(4);
        expect(meta.hasNextPage).toBe(true);
        expect(meta.hasPrevPage).toBe(true);
      });

      it('should return instance of PaginationMeta', () => {
        const meta = PaginationMeta.create({ totalCount: 10 });

        expect(meta).toBeInstanceOf(PaginationMeta);
      });
    });

    describe('decorator metadata', () => {
      it('should have ApiProperty decorator for totalCount', () => {
        const metadata = Reflect.getMetadata(
          'swagger/apiModelProperties',
          PaginationMeta.prototype,
          'totalCount',
        );

        expect(metadata).toBeDefined();
        expect(metadata.description).toBe('Total number of items');
        expect(metadata.example).toBe(125);
      });

      it('should have ApiProperty decorator for totalPages', () => {
        const metadata = Reflect.getMetadata(
          'swagger/apiModelProperties',
          PaginationMeta.prototype,
          'totalPages',
        );

        expect(metadata).toBeDefined();
        expect(metadata.description).toBe('Total number of pages');
        expect(metadata.example).toBe(13);
      });

      it('should have ApiProperty decorator for currentPage', () => {
        const metadata = Reflect.getMetadata(
          'swagger/apiModelProperties',
          PaginationMeta.prototype,
          'currentPage',
        );

        expect(metadata).toBeDefined();
        expect(metadata.description).toBe('Current page number');
        expect(metadata.example).toBe(1);
      });

      it('should have ApiProperty decorator for hasNextPage', () => {
        const metadata = Reflect.getMetadata(
          'swagger/apiModelProperties',
          PaginationMeta.prototype,
          'hasNextPage',
        );

        expect(metadata).toBeDefined();
        expect(metadata.description).toBe('Whether there is a next page');
        expect(metadata.example).toBe(true);
      });

      it('should have ApiProperty decorator for hasPrevPage', () => {
        const metadata = Reflect.getMetadata(
          'swagger/apiModelProperties',
          PaginationMeta.prototype,
          'hasPrevPage',
        );

        expect(metadata).toBeDefined();
        expect(metadata.description).toBe('Whether there is a previous page');
        expect(metadata.example).toBe(false);
      });
    });
  });
});
