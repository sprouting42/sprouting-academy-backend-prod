import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';

// Import with side effect to ensure coverage tracking
import '@/infrastructures/database/abstracts/base.dto';
import { BaseDatabaseDto } from '@/infrastructures/database/abstracts/base.dto';

// Create a concrete implementation for testing
class TestDto extends BaseDatabaseDto {
  name: string;
}

describe('BaseDatabaseDto', () => {
  it('should be defined', () => {
    expect(BaseDatabaseDto).toBeDefined();
    expect(typeof BaseDatabaseDto).toBe('function');
  });

  it('should have id property', () => {
    const dto = new TestDto();
    dto.id = '123e4567-e89b-12d3-a456-426614174000';

    expect(dto).toHaveProperty('id');
    expect(dto.id).toBe('123e4567-e89b-12d3-a456-426614174000');
  });

  it('should have createdAt property', () => {
    const dto = new TestDto();
    dto.createdAt = new Date();

    expect(dto).toHaveProperty('createdAt');
    expect(dto.createdAt).toBeInstanceOf(Date);
  });

  it('should have updatedAt property', () => {
    const dto = new TestDto();
    dto.updatedAt = new Date();

    expect(dto).toHaveProperty('updatedAt');
    expect(dto.updatedAt).toBeInstanceOf(Date);
  });

  it('should validate UUID format for id', async () => {
    const dto = new TestDto();
    dto.id = '123e4567-e89b-12d3-a456-426614174000';
    dto.createdAt = new Date();

    const errors = await validate(dto);
    const idErrors = errors.filter(e => e.property === 'id');

    expect(idErrors).toHaveLength(0);
  });

  it('should fail validation for invalid UUID', async () => {
    const dto = new TestDto();
    dto.id = 'not-a-uuid';
    dto.createdAt = new Date();

    const errors = await validate(dto);
    const idErrors = errors.filter(e => e.property === 'id');

    expect(idErrors.length).toBeGreaterThan(0);
  });

  it('should validate Date type for createdAt', async () => {
    const dto = new TestDto();
    dto.id = '123e4567-e89b-12d3-a456-426614174000';
    dto.createdAt = new Date();

    const errors = await validate(dto);
    const createdAtErrors = errors.filter(e => e.property === 'createdAt');

    expect(createdAtErrors).toHaveLength(0);
  });

  it('should transform plain object to instance with Date types', () => {
    const plain = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
      name: 'Test',
    };

    const dto = plainToInstance(TestDto, plain);

    expect(dto.createdAt).toBeInstanceOf(Date);
    expect(dto.updatedAt).toBeInstanceOf(Date);
  });

  it('should allow updatedAt to be optional', async () => {
    const dto = new TestDto();
    dto.id = '123e4567-e89b-12d3-a456-426614174000';
    dto.createdAt = new Date();
    // updatedAt is not set

    const errors = await validate(dto);
    const updatedAtErrors = errors.filter(e => e.property === 'updatedAt');

    expect(updatedAtErrors).toHaveLength(0);
  });

  it('should expose all properties correctly', () => {
    const dto = new TestDto();
    dto.id = '123e4567-e89b-12d3-a456-426614174000';
    dto.createdAt = new Date('2024-01-01');
    dto.updatedAt = new Date('2024-01-02');
    dto.name = 'Test Name';

    expect(dto.id).toBeDefined();
    expect(dto.createdAt).toBeDefined();
    expect(dto.updatedAt).toBeDefined();
    expect(dto.name).toBeDefined();
  });

  it('should handle different dates for createdAt and updatedAt', () => {
    const createdAt = new Date('2024-01-01');
    const updatedAt = new Date('2024-01-15');

    const dto = new TestDto();
    dto.id = '123e4567-e89b-12d3-a456-426614174000';
    dto.createdAt = createdAt;
    dto.updatedAt = updatedAt;

    expect(dto.createdAt).toBe(createdAt);
    expect(dto.updatedAt).toBe(updatedAt);
    expect(dto.createdAt.getTime()).toBeLessThan(dto.updatedAt.getTime());
  });
});
