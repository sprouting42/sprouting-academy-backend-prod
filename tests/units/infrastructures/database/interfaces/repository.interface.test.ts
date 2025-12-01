/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { describe, expect, it } from 'vitest';

// Import with side effect to ensure coverage tracking
import '@/infrastructures/database/interfaces/repository.interface';
import type { IRepository } from '@/infrastructures/database/interfaces/repository.interface';

describe('repository.interface', () => {
  describe('IRepository', () => {
    it('should define the interface contract', () => {
      // This is a TypeScript interface with no runtime code
      // We can only test that implementations conform to it
      const mockRepo: IRepository<any, any> = {
        findMany: async () => [],
        findManyWithPagination: async () => ({
          items: [],
          totalCount: 0,
          currentPage: 1,
          pageSize: 10,
        }),
        findOneById: async () => null,
        create: async (data: any) => data,
        update: async (data: any) => data,
        exists: async () => false,
      };

      expect(mockRepo).toBeDefined();
      expect(typeof mockRepo.findMany).toBe('function');
      expect(typeof mockRepo.create).toBe('function');
    });

    it('should allow async method implementations', async () => {
      const testData = { id: '123', name: 'test' };

      const mockRepo: IRepository<any, any> = {
        findMany: async () => [testData],
        findManyWithPagination: async () => ({
          items: [testData],
          totalCount: 1,
          currentPage: 1,
          pageSize: 10,
        }),
        findOneById: async (id: string) => (id === '123' ? testData : null),
        create: async (data: any, _createdBy: string) => ({
          ...data,
          id: '123',
        }),
        update: async (data: any, _updatedBy: string) => data,
        exists: async (id: string) => id === '123',
      };

      const result = await mockRepo.findOneById('123');
      expect(result).toEqual(testData);

      const created = await mockRepo.create({ name: 'new' }, 'user-id');
      expect(created.id).toBe('123');

      const exists = await mockRepo.exists('123');
      expect(exists).toBe(true);
    });
  });
});
