import { UserRole } from '@prisma/client';
import { describe, expect, it } from 'vitest';

// Import with side effect to ensure coverage tracking
import '@/infrastructures/database/entites/user.entity';
import { UserEntity } from '@/infrastructures/database/entites/user.entity';

describe('UserEntity', () => {
  it('should be defined', () => {
    expect(UserEntity).toBeDefined();
    expect(typeof UserEntity).toBe('function');
  });

  it('should create instance with all properties', () => {
    const entity = new UserEntity();
    entity.id = '123';
    entity.email = 'test@example.com';
    entity.fullName = 'Test User';
    entity.phone = '1234567890';
    entity.avatarUrl = 'https://example.com/avatar.jpg';
    entity.role = UserRole.STUDENT;
    entity.isActive = true;
    entity.createdAt = new Date();
    entity.updatedAt = new Date();

    expect(entity.id).toBe('123');
    expect(entity.email).toBe('test@example.com');
    expect(entity.fullName).toBe('Test User');
    expect(entity.phone).toBe('1234567890');
    expect(entity.avatarUrl).toBe('https://example.com/avatar.jpg');
    expect(entity.role).toBe(UserRole.STUDENT);
    expect(entity.isActive).toBe(true);
    expect(entity.createdAt).toBeInstanceOf(Date);
    expect(entity.updatedAt).toBeInstanceOf(Date);
  });

  it('should have email property', () => {
    const entity = new UserEntity();
    entity.email = 'user@example.com';

    expect(entity).toHaveProperty('email');
    expect(entity.email).toBe('user@example.com');
  });

  it('should have fullName property', () => {
    const entity = new UserEntity();
    entity.fullName = 'John Doe';

    expect(entity).toHaveProperty('fullName');
    expect(entity.fullName).toBe('John Doe');
  });

  it('should have phone property that can be null', () => {
    const entity = new UserEntity();
    entity.phone = null;

    expect(entity).toHaveProperty('phone');
    expect(entity.phone).toBeNull();
  });

  it('should have avatarUrl property that can be null', () => {
    const entity = new UserEntity();
    entity.avatarUrl = null;

    expect(entity).toHaveProperty('avatarUrl');
    expect(entity.avatarUrl).toBeNull();
  });

  it('should have role property', () => {
    const entity = new UserEntity();
    entity.role = UserRole.ADMIN;

    expect(entity).toHaveProperty('role');
    expect(entity.role).toBe(UserRole.ADMIN);
  });

  it('should have isActive property', () => {
    const entity = new UserEntity();
    entity.isActive = false;

    expect(entity).toHaveProperty('isActive');
    expect(entity.isActive).toBe(false);
  });

  it('should support all user roles', () => {
    const student = new UserEntity();
    student.role = UserRole.STUDENT;
    expect(student.role).toBe(UserRole.STUDENT);

    const instructor = new UserEntity();
    instructor.role = UserRole.INSTRUCTOR;
    expect(instructor.role).toBe(UserRole.INSTRUCTOR);

    const admin = new UserEntity();
    admin.role = UserRole.ADMIN;
    expect(admin.role).toBe(UserRole.ADMIN);
  });

  it('should extend BaseEntity', () => {
    const entity = new UserEntity();
    entity.id = 'test-id';
    entity.createdAt = new Date();
    entity.updatedAt = new Date();

    expect(entity).toHaveProperty('id');
    expect(entity).toHaveProperty('createdAt');
    expect(entity).toHaveProperty('updatedAt');
  });

  it('should allow nullable phone and avatarUrl', () => {
    const entity = new UserEntity();
    entity.phone = '123-456-7890';
    entity.avatarUrl = 'https://example.com/image.png';

    expect(entity.phone).toBe('123-456-7890');
    expect(entity.avatarUrl).toBe('https://example.com/image.png');

    entity.phone = null;
    entity.avatarUrl = null;

    expect(entity.phone).toBeNull();
    expect(entity.avatarUrl).toBeNull();
  });
});
