import { describe, it, expect } from 'vitest';

import { AuthUserProfileOutput } from '@/domains/auth/services/dto/auth-user-profile.output';
import { UserRole } from '@/infrastructures/database/enums/user-role';

describe('AuthUserProfileOutput', () => {
  it('should create output with all fields provided', () => {
    const createdAt = new Date('2024-01-01');
    const updatedAt = new Date('2024-01-02');

    const result = AuthUserProfileOutput.create({
      id: 'user-123',
      email: 'test@example.com',
      fullName: 'Test User',
      role: UserRole.STUDENT,
      phone: '+1234567890',
      avatarUrl: 'https://example.com/avatar.jpg',
      isActive: true,
      createdAt,
      updatedAt,
    });

    expect(result.id).toBe('user-123');
    expect(result.email).toBe('test@example.com');
    expect(result.fullName).toBe('Test User');
    expect(result.role).toBe(UserRole.STUDENT);
    expect(result.phone).toBe('+1234567890');
    expect(result.avatarUrl).toBe('https://example.com/avatar.jpg');
    expect(result.isActive).toBe(true);
    expect(result.createdAt).toBe(createdAt);
    expect(result.updatedAt).toBe(updatedAt);
  });

  it('should use default values when optional fields are not provided', () => {
    const result = AuthUserProfileOutput.create({
      id: 'user-456',
      email: 'minimal@example.com',
      fullName: 'Minimal User',
      role: UserRole.ADMIN,
    });

    expect(result.id).toBe('user-456');
    expect(result.email).toBe('minimal@example.com');
    expect(result.fullName).toBe('Minimal User');
    expect(result.role).toBe(UserRole.ADMIN);
    expect(result.phone).toBe(null);
    expect(result.avatarUrl).toBe(null);
    expect(result.isActive).toBe(true);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('should handle null values for optional fields', () => {
    const result = AuthUserProfileOutput.create({
      id: 'user-789',
      email: 'null@example.com',
      fullName: 'Null User',
      role: UserRole.INSTRUCTOR,
      phone: null,
      avatarUrl: null,
      isActive: false,
    });

    expect(result.phone).toBe(null);
    expect(result.avatarUrl).toBe(null);
    expect(result.isActive).toBe(false);
  });
});
