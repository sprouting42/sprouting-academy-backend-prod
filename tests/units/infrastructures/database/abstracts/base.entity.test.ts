import { describe, expect, it } from 'vitest';

// Import with side effect to ensure coverage tracking
import '@/infrastructures/database/abstracts/base.entity';
import { BaseEntity } from '@/infrastructures/database/abstracts/base.entity';

// Create a concrete implementation for testing
class TestEntity extends BaseEntity {
  name: string;
  constructor(id: string, createdAt: Date, updatedAt: Date, name: string) {
    super();
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.name = name;
  }
}

describe('BaseEntity', () => {
  it('should be defined', () => {
    expect(BaseEntity).toBeDefined();
    expect(typeof BaseEntity).toBe('function');
  });

  it('should allow creating instances with required properties', () => {
    const now = new Date();
    const entity = new TestEntity('123', now, now, 'Test');

    expect(entity).toBeDefined();
    expect(entity.id).toBe('123');
    expect(entity.createdAt).toBe(now);
    expect(entity.updatedAt).toBe(now);
    expect(entity.name).toBe('Test');
  });

  it('should have id property', () => {
    const entity = new TestEntity('test-id', new Date(), new Date(), 'Test');
    expect(entity).toHaveProperty('id');
    expect(typeof entity.id).toBe('string');
  });

  it('should have createdAt property', () => {
    const entity = new TestEntity('123', new Date(), new Date(), 'Test');
    expect(entity).toHaveProperty('createdAt');
    expect(entity.createdAt).toBeInstanceOf(Date);
  });

  it('should have updatedAt property', () => {
    const entity = new TestEntity('123', new Date(), new Date(), 'Test');
    expect(entity).toHaveProperty('updatedAt');
    expect(entity.updatedAt).toBeInstanceOf(Date);
  });

  it('should allow different dates for createdAt and updatedAt', () => {
    const createdAt = new Date('2024-01-01');
    const updatedAt = new Date('2024-01-02');
    const entity = new TestEntity('123', createdAt, updatedAt, 'Test');

    expect(entity.createdAt).toBe(createdAt);
    expect(entity.updatedAt).toBe(updatedAt);
    expect(entity.createdAt).not.toBe(entity.updatedAt);
  });
});
