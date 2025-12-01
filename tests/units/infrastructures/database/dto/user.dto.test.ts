import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';

// Import with side effect to ensure coverage tracking
import '@/infrastructures/database/dto/user.dto';
import { BaseDatabaseDto } from '@/infrastructures/database/abstracts/base.dto';
import { UserDto } from '@/infrastructures/database/dto/user.dto';
import { UserRole } from '@/infrastructures/database/enums/user-role';

describe('UserDto', () => {
  it('should be defined', () => {
    expect(UserDto).toBeDefined();
    expect(typeof UserDto).toBe('function');
  });

  it('should extend BaseDatabaseDto', () => {
    const dto = new UserDto();
    expect(dto).toBeInstanceOf(BaseDatabaseDto);
  });

  it('should create instance with all required properties', () => {
    const dto = new UserDto();
    dto.id = '123e4567-e89b-12d3-a456-426614174000';
    dto.email = 'test@example.com';
    dto.fullName = 'Test User';
    dto.role = UserRole.STUDENT;
    dto.isActive = true;
    dto.createdAt = new Date();
    dto.updatedAt = new Date();

    expect(dto.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(dto.email).toBe('test@example.com');
    expect(dto.fullName).toBe('Test User');
    expect(dto.role).toBe(UserRole.STUDENT);
    expect(dto.isActive).toBe(true);
  });

  it('should have email property', () => {
    const dto = new UserDto();
    dto.email = 'user@example.com';

    expect(dto).toHaveProperty('email');
    expect(dto.email).toBe('user@example.com');
  });

  it('should have fullName property', () => {
    const dto = new UserDto();
    dto.fullName = 'John Doe';

    expect(dto).toHaveProperty('fullName');
    expect(dto.fullName).toBe('John Doe');
  });

  it('should have optional phone property', () => {
    const dto = new UserDto();
    dto.phone = '+1234567890';

    expect(dto).toHaveProperty('phone');
    expect(dto.phone).toBe('+1234567890');
  });

  it('should allow phone to be undefined', () => {
    const dto = new UserDto();
    expect(dto.phone).toBeUndefined();
  });

  it('should have optional avatarUrl property', () => {
    const dto = new UserDto();
    dto.avatarUrl = 'https://example.com/avatar.jpg';

    expect(dto).toHaveProperty('avatarUrl');
    expect(dto.avatarUrl).toBe('https://example.com/avatar.jpg');
  });

  it('should allow avatarUrl to be undefined', () => {
    const dto = new UserDto();
    expect(dto.avatarUrl).toBeUndefined();
  });

  it('should have role property', () => {
    const dto = new UserDto();
    dto.role = UserRole.ADMIN;

    expect(dto).toHaveProperty('role');
    expect(dto.role).toBe(UserRole.ADMIN);
  });

  it('should have isActive property', () => {
    const dto = new UserDto();
    dto.isActive = false;

    expect(dto).toHaveProperty('isActive');
    expect(dto.isActive).toBe(false);
  });

  it('should support all user roles', () => {
    const student = new UserDto();
    student.role = UserRole.STUDENT;
    expect(student.role).toBe(UserRole.STUDENT);

    const instructor = new UserDto();
    instructor.role = UserRole.INSTRUCTOR;
    expect(instructor.role).toBe(UserRole.INSTRUCTOR);

    const admin = new UserDto();
    admin.role = UserRole.ADMIN;
    expect(admin.role).toBe(UserRole.ADMIN);
  });

  it('should validate email as string', async () => {
    const dto = new UserDto();
    dto.id = '123e4567-e89b-12d3-a456-426614174000';
    dto.email = 'valid@email.com';
    dto.fullName = 'Test User';
    dto.role = UserRole.STUDENT;
    dto.isActive = true;
    dto.createdAt = new Date();

    const errors = await validate(dto);
    const emailErrors = errors.filter(e => e.property === 'email');

    expect(emailErrors).toHaveLength(0);
  });

  it('should validate fullName as string', async () => {
    const dto = new UserDto();
    dto.id = '123e4567-e89b-12d3-a456-426614174000';
    dto.email = 'test@example.com';
    dto.fullName = 'Valid Name';
    dto.role = UserRole.STUDENT;
    dto.isActive = true;
    dto.createdAt = new Date();

    const errors = await validate(dto);
    const fullNameErrors = errors.filter(e => e.property === 'fullName');

    expect(fullNameErrors).toHaveLength(0);
  });

  it('should validate role as enum', async () => {
    const dto = new UserDto();
    dto.id = '123e4567-e89b-12d3-a456-426614174000';
    dto.email = 'test@example.com';
    dto.fullName = 'Test User';
    dto.role = UserRole.STUDENT;
    dto.isActive = true;
    dto.createdAt = new Date();

    const errors = await validate(dto);
    const roleErrors = errors.filter(e => e.property === 'role');

    expect(roleErrors).toHaveLength(0);
  });

  it('should validate isActive as boolean', async () => {
    const dto = new UserDto();
    dto.id = '123e4567-e89b-12d3-a456-426614174000';
    dto.email = 'test@example.com';
    dto.fullName = 'Test User';
    dto.role = UserRole.STUDENT;
    dto.isActive = true;
    dto.createdAt = new Date();

    const errors = await validate(dto);
    const isActiveErrors = errors.filter(e => e.property === 'isActive');

    expect(isActiveErrors).toHaveLength(0);
  });

  it('should transform plain object to instance', () => {
    const plain = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      fullName: 'Test User',
      phone: '+1234567890',
      avatarUrl: 'https://example.com/avatar.jpg',
      role: UserRole.STUDENT,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    };

    const dto = plainToInstance(UserDto, plain);

    expect(dto).toBeInstanceOf(UserDto);
    expect(dto.email).toBe('test@example.com');
    expect(dto.fullName).toBe('Test User');
    expect(dto.phone).toBe('+1234567890');
    expect(dto.avatarUrl).toBe('https://example.com/avatar.jpg');
    expect(dto.role).toBe(UserRole.STUDENT);
    expect(dto.isActive).toBe(true);
    expect(dto.createdAt).toBeInstanceOf(Date);
    expect(dto.updatedAt).toBeInstanceOf(Date);
  });

  it('should allow optional fields to be undefined', async () => {
    const dto = new UserDto();
    dto.id = '123e4567-e89b-12d3-a456-426614174000';
    dto.email = 'test@example.com';
    dto.fullName = 'Test User';
    dto.role = UserRole.STUDENT;
    dto.isActive = true;
    dto.createdAt = new Date();
    // phone and avatarUrl not set

    const errors = await validate(dto);
    const phoneErrors = errors.filter(e => e.property === 'phone');
    const avatarUrlErrors = errors.filter(e => e.property === 'avatarUrl');

    expect(phoneErrors).toHaveLength(0);
    expect(avatarUrlErrors).toHaveLength(0);
  });

  it('should inherit id, createdAt, and updatedAt from BaseDatabaseDto', () => {
    const dto = new UserDto();
    dto.id = '123e4567-e89b-12d3-a456-426614174000';
    dto.createdAt = new Date();
    dto.updatedAt = new Date();

    expect(dto).toHaveProperty('id');
    expect(dto).toHaveProperty('createdAt');
    expect(dto).toHaveProperty('updatedAt');
  });
});
