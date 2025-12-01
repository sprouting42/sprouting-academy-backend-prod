import 'reflect-metadata';

import { describe, it, expect } from 'vitest';

import { MapperUtil } from '@/utils/mapper.util';

import type { TestEntity } from './mocks/mapper.util.mock';
import { TestDto } from './mocks/mapper.util.mock';

describe('MapperUtil', () => {
  describe('mapper', () => {
    it('should map entity to DTO successfully', () => {
      const entity: Partial<TestEntity> = {
        id: '1',
        name: 'John Doe',
        age: 30,
        secretField: 'secret',
      };

      const result = MapperUtil.mapper(TestDto, entity);

      expect(result).toBeInstanceOf(TestDto);
      expect(result.id).toBe('1');
      expect(result.name).toBe('John Doe');
      expect(result.age).toBe(30);
      expect(result).not.toHaveProperty('secretField');
    });

    it('should handle partial entity data', () => {
      const entity: Partial<TestEntity> = {
        id: '2',
        name: 'Jane Doe',
      };

      const result = MapperUtil.mapper(TestDto, entity);

      expect(result).toBeInstanceOf(TestDto);
      expect(result.id).toBe('2');
      expect(result.name).toBe('Jane Doe');
      expect(result.age).toBeUndefined();
    });

    it('should handle empty object', () => {
      const entity: Partial<TestEntity> = {};

      const result = MapperUtil.mapper(TestDto, entity);

      expect(result).toBeInstanceOf(TestDto);
      expect(result.id).toBeUndefined();
      expect(result.name).toBeUndefined();
      expect(result.age).toBeUndefined();
    });

    it('should convert string to number when enableImplicitConversion is true', () => {
      const entity: Partial<TestEntity> = {
        id: '3',
        name: 'Test',
        age: '25' as unknown as number,
      };

      const result = MapperUtil.mapper(TestDto, entity);

      expect(result).toBeInstanceOf(TestDto);
      expect(result.age).toBe(25);
      expect(typeof result.age).toBe('number');
    });
  });

  describe('mapMany', () => {
    it('should map array of entities to DTOs successfully', () => {
      const entities: Partial<TestEntity>[] = [
        {
          id: '1',
          name: 'John Doe',
          age: 30,
          secretField: 'secret1',
        },
        {
          id: '2',
          name: 'Jane Doe',
          age: 25,
          secretField: 'secret2',
        },
        {
          id: '3',
          name: 'Bob Smith',
          age: 35,
          secretField: 'secret3',
        },
      ];

      const results = MapperUtil.mapMany(TestDto, entities);

      expect(results).toHaveLength(3);

      const [first, second, third] = results;

      expect(first).toBeInstanceOf(TestDto);
      expect(first?.id).toBe('1');
      expect(first?.name).toBe('John Doe');
      expect(first?.age).toBe(30);
      expect(first).not.toHaveProperty('secretField');

      expect(second).toBeInstanceOf(TestDto);
      expect(second?.id).toBe('2');
      expect(second?.name).toBe('Jane Doe');
      expect(second?.age).toBe(25);

      expect(third).toBeInstanceOf(TestDto);
      expect(third?.id).toBe('3');
      expect(third?.name).toBe('Bob Smith');
      expect(third?.age).toBe(35);
    });

    it('should handle empty array', () => {
      const entities: Partial<TestEntity>[] = [];

      const results = MapperUtil.mapMany(TestDto, entities);

      expect(results).toHaveLength(0);
      expect(results).toEqual([]);
    });

    it('should handle array with one element', () => {
      const entities: Partial<TestEntity>[] = [
        {
          id: '1',
          name: 'Single User',
          age: 28,
        },
      ];

      const results = MapperUtil.mapMany(TestDto, entities);

      expect(results).toHaveLength(1);

      const [first] = results;

      expect(first).toBeInstanceOf(TestDto);
      expect(first?.id).toBe('1');
      expect(first?.name).toBe('Single User');
      expect(first?.age).toBe(28);
    });

    it('should handle array with partial data', () => {
      const entities: Partial<TestEntity>[] = [
        { id: '1', name: 'User 1' },
        { id: '2', age: 30 },
        { name: 'User 3', age: 25 },
      ];

      const results = MapperUtil.mapMany(TestDto, entities);

      expect(results).toHaveLength(3);

      const [first, second, third] = results;

      expect(first?.id).toBe('1');
      expect(first?.name).toBe('User 1');
      expect(first?.age).toBeUndefined();

      expect(second?.id).toBe('2');
      expect(second?.name).toBeUndefined();
      expect(second?.age).toBe(30);

      expect(third?.id).toBeUndefined();
      expect(third?.name).toBe('User 3');
      expect(third?.age).toBe(25);
    });

    it('should handle large arrays efficiently', () => {
      const entities: Partial<TestEntity>[] = Array.from(
        { length: 1000 },
        (_, i) => ({
          id: `id-${i}`,
          name: `User ${i}`,
          age: 20 + (i % 50),
        }),
      );

      const results = MapperUtil.mapMany(TestDto, entities);

      expect(results).toHaveLength(1000);

      const first = results[0];
      const last = results[999];

      expect(first).toBeDefined();
      expect(last).toBeDefined();

      if (first && last) {
        expect(first.id).toBe('id-0');
        expect(last.id).toBe('id-999');
        expect(last.name).toBe('User 999');
      }
    });
  });
});
