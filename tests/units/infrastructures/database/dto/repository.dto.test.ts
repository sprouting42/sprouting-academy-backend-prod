/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { describe, expect, it } from 'vitest';

import { SortOrder } from '@/enums/pagination.enum';
import {
  FindManyArgs,
  FindManyPaginatedArgs,
  PaginatedResult,
  PaginationArgs,
} from '@/infrastructures/database/dto/repository.dto';

describe('PaginationArgs', () => {
  it('should be defined', () => {
    expect(PaginationArgs).toBeDefined();
  });

  it('should create with default values', () => {
    const args = new PaginationArgs();

    expect(args.pageNumber).toBe(1);
    expect(args.pageSize).toBe(10);
  });

  it('should create with custom values', () => {
    const args = new PaginationArgs({ pageNumber: 2, pageSize: 20 });

    expect(args.pageNumber).toBe(2);
    expect(args.pageSize).toBe(20);
  });

  it('should accept partial initialization', () => {
    const args = new PaginationArgs({ pageNumber: 5 });

    expect(args.pageNumber).toBe(5);
    expect(args.pageSize).toBe(10);
  });
});

describe('FindManyArgs', () => {
  it('should be defined', () => {
    expect(FindManyArgs).toBeDefined();
  });

  it('should create with default values', () => {
    const args = new FindManyArgs();

    expect(args.where).toEqual({});
    expect(args.orderBy).toEqual({});
  });

  it('should create with custom where clause', () => {
    const where = { id: '123' } as any;
    const args = new FindManyArgs({ where });

    expect(args.where).toEqual(where);
  });

  it('should create with custom orderBy clause', () => {
    const orderBy = { createdAt: SortOrder.DESC } as any;
    const args = new FindManyArgs({ orderBy });

    expect(args.orderBy).toEqual(orderBy);
  });

  it('should accept both where and orderBy', () => {
    const where = { active: true } as any;
    const orderBy = { name: SortOrder.ASC } as any;
    const args = new FindManyArgs({ where, orderBy });

    expect(args.where).toEqual(where);
    expect(args.orderBy).toEqual(orderBy);
  });
});

describe('FindManyPaginatedArgs', () => {
  it('should be defined', () => {
    expect(FindManyPaginatedArgs).toBeDefined();
  });

  it('should extend FindManyArgs', () => {
    const args = new FindManyPaginatedArgs();

    expect(args).toHaveProperty('where');
    expect(args).toHaveProperty('orderBy');
    expect(args).toHaveProperty('pagination');
  });

  it('should create with default pagination', () => {
    const args = new FindManyPaginatedArgs();

    expect(args.pagination).toBeDefined();
    expect(args.pagination?.pageNumber).toBe(1);
    expect(args.pagination?.pageSize).toBe(10);
  });

  it('should create with custom pagination', () => {
    const args = new FindManyPaginatedArgs({
      pagination: { pageNumber: 3, pageSize: 25 },
    });

    expect(args.pagination?.pageNumber).toBe(3);
    expect(args.pagination?.pageSize).toBe(25);
  });

  it('should create with all parameters', () => {
    const where = { status: 'active' } as any;
    const orderBy = { createdAt: SortOrder.DESC } as any;
    const pagination = { pageNumber: 2, pageSize: 50 };

    const args = new FindManyPaginatedArgs({ where, orderBy, pagination });

    expect(args.where).toEqual(where);
    expect(args.orderBy).toEqual(orderBy);
    expect(args.pagination?.pageNumber).toBe(2);
    expect(args.pagination?.pageSize).toBe(50);
  });
});

describe('PaginatedResult', () => {
  it('should be defined', () => {
    expect(PaginatedResult).toBeDefined();
  });

  it('should create with default values', () => {
    const result = PaginatedResult.create<string>([]);

    expect(result.items).toEqual([]);
    expect(result.totalCount).toBe(0);
    expect(result.currentPage).toBe(1);
    expect(result.pageSize).toBe(10);
  });

  it('should create with items', () => {
    const items = ['item1', 'item2', 'item3'];
    const result = PaginatedResult.create(items);

    expect(result.items).toEqual(items);
    expect(result.items.length).toBe(3);
  });

  it('should create with custom totalCount', () => {
    const result = PaginatedResult.create(['item1'], 100);

    expect(result.totalCount).toBe(100);
  });

  it('should create with custom currentPage', () => {
    const result = PaginatedResult.create(['item1'], 100, 5);

    expect(result.currentPage).toBe(5);
  });

  it('should create with custom pageSize', () => {
    const result = PaginatedResult.create(['item1'], 100, 1, 25);

    expect(result.pageSize).toBe(25);
  });

  it('should create with all custom parameters', () => {
    const items = ['a', 'b', 'c'];
    const result = PaginatedResult.create(items, 150, 3, 50);

    expect(result.items).toEqual(items);
    expect(result.totalCount).toBe(150);
    expect(result.currentPage).toBe(3);
    expect(result.pageSize).toBe(50);
  });

  it('should work with different types', () => {
    interface TestItem {
      id: number;
      name: string;
    }

    const items: TestItem[] = [
      { id: 1, name: 'Test 1' },
      { id: 2, name: 'Test 2' },
    ];

    const result = PaginatedResult.create(items, 10, 1, 5);

    expect(result.items).toEqual(items);
    expect(result.items[0]?.id).toBe(1);
    expect(result.items[1]?.name).toBe('Test 2');
  });

  it('should handle empty array', () => {
    const result = PaginatedResult.create<number>([], 0, 1, 10);

    expect(result.items).toEqual([]);
    expect(result.items.length).toBe(0);
  });
});
