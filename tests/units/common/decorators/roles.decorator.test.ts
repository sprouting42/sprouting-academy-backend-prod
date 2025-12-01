import '../mocks/nest-common.mock.ts';
import { SetMetadata } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Roles, ROLES_KEY } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/infrastructures/database/enums/user-role';

describe('Roles Decorator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(Roles).toBeDefined();
    expect(ROLES_KEY).toBeDefined();
  });

  it('should have correct ROLES_KEY constant', () => {
    expect(ROLES_KEY).toBe('roles');
  });

  it('should call SetMetadata with ROLES_KEY and single role', () => {
    Roles(UserRole.ADMIN);

    expect(SetMetadata).toHaveBeenCalledWith(ROLES_KEY, [UserRole.ADMIN]);
  });

  it('should call SetMetadata with ROLES_KEY and multiple roles', () => {
    Roles(UserRole.ADMIN, UserRole.INSTRUCTOR);

    expect(SetMetadata).toHaveBeenCalledWith(ROLES_KEY, [
      UserRole.ADMIN,
      UserRole.INSTRUCTOR,
    ]);
  });

  it('should handle all role types', () => {
    Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT);

    expect(SetMetadata).toHaveBeenCalledWith(ROLES_KEY, [
      UserRole.ADMIN,
      UserRole.INSTRUCTOR,
      UserRole.STUDENT,
    ]);
  });

  it('should return result from SetMetadata', () => {
    const result = Roles(UserRole.ADMIN);

    expect(result).toBeDefined();
    expect(SetMetadata).toHaveBeenCalledWith(ROLES_KEY, [UserRole.ADMIN]);
  });

  it('should work with no roles (empty array)', () => {
    Roles();

    expect(SetMetadata).toHaveBeenCalledWith(ROLES_KEY, []);
  });

  it('should preserve role order', () => {
    Roles(UserRole.STUDENT, UserRole.ADMIN, UserRole.INSTRUCTOR);

    expect(SetMetadata).toHaveBeenCalledWith(ROLES_KEY, [
      UserRole.STUDENT,
      UserRole.ADMIN,
      UserRole.INSTRUCTOR,
    ]);
  });
});
