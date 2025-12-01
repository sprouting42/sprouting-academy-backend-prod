/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SortOrder } from '@/enums/pagination.enum';
import { BaseRepository } from '@/infrastructures/database/abstracts/base.repository';
import type { FindManyArgs } from '@/infrastructures/database/dto/repository.dto';
import { PaginatedResult } from '@/infrastructures/database/dto/repository.dto';
import { MapperUtil } from '@/utils/mapper.util';
import { NanoUtil } from '@/utils/nano.util';

// Mock the utilities
vi.mock('@/utils/mapper.util', () => ({
  MapperUtil: {
    mapMany: vi.fn(),
    mapper: vi.fn(),
  },
}));

vi.mock('@/utils/nano.util', () => ({
  NanoUtil: {
    generateId: vi.fn(),
  },
}));

// Test entity and DTO
interface TestEntity {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

class TestDto {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Concrete implementation for testing
class TestRepository extends BaseRepository<TestEntity, TestDto, any> {
  constructor(context: any, dtoClass: new () => TestDto) {
    super(context, dtoClass);
  }
}

describe('BaseRepository', () => {
  let repository: TestRepository;
  let mockContext: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockContext = {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    };

    repository = new TestRepository(mockContext, TestDto);
  });

  describe('findMany', () => {
    it('should find many items with default ordering', async () => {
      const mockItems = [
        { id: '1', name: 'Item 1', created_at: new Date() },
        { id: '2', name: 'Item 2', created_at: new Date() },
      ];

      mockContext.findMany.mockResolvedValue(mockItems);
      vi.spyOn(MapperUtil, 'mapMany').mockReturnValue([
        { id: '1', name: 'Item 1' } as any,
        { id: '2', name: 'Item 2' } as any,
      ]);

      const args: FindManyArgs = { where: {} };
      await repository.findMany(args);

      expect(mockContext.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { created_at: SortOrder.DESC },
      });
    });

    it('should find many items with custom where clause', async () => {
      const mockItems = [{ id: '1', name: 'Item 1' }];
      mockContext.findMany.mockResolvedValue(mockItems);
      vi.spyOn(MapperUtil, 'mapMany').mockReturnValue([
        { id: '1', name: 'Item 1' } as any,
      ]);

      const args: FindManyArgs = {
        where: { name: 'Item 1' } as any,
      };
      await repository.findMany(args);

      expect(mockContext.findMany).toHaveBeenCalledWith({
        where: { name: 'Item 1' },
        orderBy: { created_at: SortOrder.DESC },
      });
    });

    it('should find many items with custom orderBy', async () => {
      const mockItems = [{ id: '1', name: 'Item 1' }];
      mockContext.findMany.mockResolvedValue(mockItems);
      vi.spyOn(MapperUtil, 'mapMany').mockReturnValue([
        { id: '1', name: 'Item 1' } as any,
      ]);

      const args: FindManyArgs = {
        where: {},
        orderBy: { name: SortOrder.ASC } as any,
      };
      await repository.findMany(args);

      expect(mockContext.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { name: SortOrder.ASC },
      });
    });

    it('should map results using MapperUtil', async () => {
      const mockItems = [{ id: '1', name: 'Item 1' }];
      const mappedItems = [{ id: '1', name: 'Item 1' } as any];

      mockContext.findMany.mockResolvedValue(mockItems);
      vi.spyOn(MapperUtil, 'mapMany').mockReturnValue(mappedItems);

      const result = await repository.findMany({ where: {} });

      expect(MapperUtil.mapMany).toHaveBeenCalledWith(TestDto, mockItems);
      expect(result).toBe(mappedItems);
    });
  });

  describe('findManyWithPagination', () => {
    it('should find items with default pagination', async () => {
      const mockItems = [{ id: '1', name: 'Item 1' }];
      mockContext.findMany.mockResolvedValue(mockItems);
      mockContext.count.mockResolvedValue(10);
      vi.spyOn(MapperUtil, 'mapMany').mockReturnValue([
        { id: '1', name: 'Item 1' } as any,
      ]);

      const args = {
        where: {},
        pagination: { pageNumber: 1, pageSize: 10 },
      };
      const result = await repository.findManyWithPagination(args);

      expect(mockContext.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { created_at: SortOrder.DESC },
        skip: 0,
        take: 10,
      });
      expect(result).toBeInstanceOf(PaginatedResult);
    });

    it('should calculate skip correctly for different pages', async () => {
      mockContext.findMany.mockResolvedValue([]);
      mockContext.count.mockResolvedValue(50);
      vi.spyOn(MapperUtil, 'mapMany').mockReturnValue([]);

      const args = {
        where: {},
        pagination: { pageNumber: 3, pageSize: 10 },
      };
      await repository.findManyWithPagination(args);

      expect(mockContext.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }),
      );
    });

    it('should count total items', async () => {
      mockContext.findMany.mockResolvedValue([]);
      mockContext.count.mockResolvedValue(100);
      vi.spyOn(MapperUtil, 'mapMany').mockReturnValue([]);

      const args = {
        where: {},
        pagination: { pageNumber: 1, pageSize: 10 },
      };
      const result = await repository.findManyWithPagination(args);

      expect(mockContext.count).toHaveBeenCalledWith({
        where: {},
      });
      expect(result.totalCount).toBe(100);
    });

    it('should handle custom page size', async () => {
      mockContext.findMany.mockResolvedValue([]);
      mockContext.count.mockResolvedValue(50);
      vi.spyOn(MapperUtil, 'mapMany').mockReturnValue([]);

      const args = {
        where: {},
        pagination: { pageNumber: 1, pageSize: 25 },
      };
      await repository.findManyWithPagination(args);

      expect(mockContext.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 25,
        }),
      );
    });

    it('should use default pagination when pagination is undefined', async () => {
      mockContext.findMany.mockResolvedValue([]);
      mockContext.count.mockResolvedValue(50);
      vi.spyOn(MapperUtil, 'mapMany').mockReturnValue([]);

      const args = {
        where: {},
        pagination: undefined,
      };
      await repository.findManyWithPagination(args);

      expect(mockContext.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0, // (1 - 1) * 10
          take: 10, // default pageSize
        }),
      );
    });

    it('should use default pageNumber when only pageSize is provided', async () => {
      mockContext.findMany.mockResolvedValue([]);
      mockContext.count.mockResolvedValue(50);
      vi.spyOn(MapperUtil, 'mapMany').mockReturnValue([]);

      const args = {
        where: {},
        pagination: { pageSize: 20 } as any,
      };
      await repository.findManyWithPagination(args);

      expect(mockContext.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0, // (1 - 1) * 20
          take: 20,
        }),
      );
    });

    it('should use default pageSize when only pageNumber is provided', async () => {
      mockContext.findMany.mockResolvedValue([]);
      mockContext.count.mockResolvedValue(50);
      vi.spyOn(MapperUtil, 'mapMany').mockReturnValue([]);

      const args = {
        where: {},
        pagination: { pageNumber: 2 } as any,
      };
      await repository.findManyWithPagination(args);

      expect(mockContext.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10, // (2 - 1) * 10
          take: 10, // default pageSize
        }),
      );
    });
  });

  describe('findOneById', () => {
    it('should find item by id', async () => {
      const mockItem = { id: '123', name: 'Test Item' };
      mockContext.findUnique.mockResolvedValue(mockItem);
      vi.spyOn(MapperUtil, 'mapper').mockReturnValue({ id: '123' } as any);

      await repository.findOneById('123');

      expect(mockContext.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
      });
    });

    it('should return null when item not found', async () => {
      mockContext.findUnique.mockResolvedValue(null);

      const result = await repository.findOneById('nonexistent');

      expect(result).toBeNull();
    });

    it('should map result using MapperUtil', async () => {
      const mockItem = { id: '123', name: 'Test' };
      const mappedItem = { id: '123', name: 'Test' } as any;

      mockContext.findUnique.mockResolvedValue(mockItem);
      vi.spyOn(MapperUtil, 'mapper').mockReturnValue(mappedItem);

      const result = await repository.findOneById('123');

      expect(MapperUtil.mapper).toHaveBeenCalledWith(TestDto, mockItem);
      expect(result).toBe(mappedItem);
    });
  });

  describe('create', () => {
    it('should create new item with generated id', async () => {
      const mockItem = { id: 'generated-id', name: 'New Item' };
      mockContext.create.mockResolvedValue(mockItem);
      vi.mocked(NanoUtil.generateId).mockReturnValue('generated-id');
      vi.spyOn(MapperUtil, 'mapper').mockReturnValue({
        id: 'generated-id',
      } as any);

      await repository.create({ name: 'New Item' } as any, 'user-123');

      expect(NanoUtil.generateId).toHaveBeenCalled();
      expect(mockContext.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'New Item',
          id: 'generated-id',
          created_by: 'user-123',
        }),
      });
    });

    it('should set created_at timestamp', async () => {
      const beforeCreate = new Date();
      mockContext.create.mockResolvedValue({ id: '1', name: 'Item' });
      vi.mocked(NanoUtil.generateId).mockReturnValue('id-1');
      vi.spyOn(MapperUtil, 'mapper').mockReturnValue({} as any);

      await repository.create({ name: 'Item' } as any, 'user-123');

      const createCall = mockContext.create.mock.calls[0]?.[0];
      expect(createCall.data.created_at).toBeInstanceOf(Date);
      expect(createCall.data.created_at.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime(),
      );
    });

    it('should map created item', async () => {
      const mockItem = { id: '1', name: 'New Item' };
      const mappedItem = { id: '1', name: 'New Item' } as any;

      mockContext.create.mockResolvedValue(mockItem);
      vi.mocked(NanoUtil.generateId).mockReturnValue('1');
      vi.spyOn(MapperUtil, 'mapper').mockReturnValue(mappedItem);

      const result = await repository.create(
        { name: 'New Item' } as any,
        'user-123',
      );

      expect(MapperUtil.mapper).toHaveBeenCalledWith(TestDto, mockItem);
      expect(result).toBe(mappedItem);
    });
  });

  describe('update', () => {
    it('should update item', async () => {
      const mockItem = { id: '123', name: 'Updated Item' };
      mockContext.update.mockResolvedValue(mockItem);
      vi.spyOn(MapperUtil, 'mapper').mockReturnValue({ id: '123' } as any);

      await repository.update(
        { id: '123', name: 'Updated Item' } as any,
        'user-456',
      );

      expect(mockContext.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: expect.objectContaining({
          name: 'Updated Item',
          updated_by: 'user-456',
        }),
      });
    });

    it('should set updated_at timestamp', async () => {
      const beforeUpdate = new Date();
      mockContext.update.mockResolvedValue({ id: '123', name: 'Item' });
      vi.spyOn(MapperUtil, 'mapper').mockReturnValue({} as any);

      await repository.update({ id: '123', name: 'Item' } as any, 'user-456');

      const updateCall = mockContext.update.mock.calls[0]?.[0];
      expect(updateCall.data.updated_at).toBeInstanceOf(Date);
      expect(updateCall.data.updated_at.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
    });

    it('should map updated item', async () => {
      const mockItem = { id: '123', name: 'Updated' };
      const mappedItem = { id: '123', name: 'Updated' } as any;

      mockContext.update.mockResolvedValue(mockItem);
      vi.spyOn(MapperUtil, 'mapper').mockReturnValue(mappedItem);

      const result = await repository.update(
        { id: '123', name: 'Updated' } as any,
        'user-456',
      );

      expect(MapperUtil.mapper).toHaveBeenCalledWith(TestDto, mockItem);
      expect(result).toBe(mappedItem);
    });
  });

  describe('exists', () => {
    it('should return true when item exists', async () => {
      mockContext.count.mockResolvedValue(1);

      const result = await repository.exists('123');

      expect(mockContext.count).toHaveBeenCalledWith({
        where: { id: '123' },
      });
      expect(result).toBe(true);
    });

    it('should return false when item does not exist', async () => {
      mockContext.count.mockResolvedValue(0);

      const result = await repository.exists('nonexistent');

      expect(result).toBe(false);
    });

    it('should handle null count', async () => {
      mockContext.count.mockResolvedValue(null);

      const result = await repository.exists('123');

      expect(result).toBe(false);
    });

    it('should handle undefined count', async () => {
      mockContext.count.mockResolvedValue(undefined);

      const result = await repository.exists('123');

      expect(result).toBe(false);
    });
  });
});
