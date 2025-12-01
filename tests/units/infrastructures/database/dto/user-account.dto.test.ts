import { describe, expect, it } from 'vitest';

// Import with side effect to ensure coverage tracking
import '@/infrastructures/database/dto/user-account.dto';
import { UserAccount } from '@/infrastructures/database/dto/user-account.dto';
import { UserRole } from '@/infrastructures/database/enums/user-role';

describe('UserAccount', () => {
  it('should be defined', () => {
    expect(UserAccount).toBeDefined();
    expect(typeof UserAccount).toBe('function');
  });

  it('should create instance with required properties', () => {
    const userAccount = new UserAccount();
    userAccount.userId = '123';
    userAccount.email = 'test@example.com';
    userAccount.role = UserRole.STUDENT;

    expect(userAccount).toBeDefined();
    expect(userAccount.userId).toBe('123');
    expect(userAccount.email).toBe('test@example.com');
    expect(userAccount.role).toBe(UserRole.STUDENT);
  });

  it('should have userId property', () => {
    const userAccount = new UserAccount();
    userAccount.userId = 'user-456';

    expect(userAccount).toHaveProperty('userId');
    expect(userAccount.userId).toBe('user-456');
  });

  it('should have email property', () => {
    const userAccount = new UserAccount();
    userAccount.email = 'admin@example.com';

    expect(userAccount).toHaveProperty('email');
    expect(userAccount.email).toBe('admin@example.com');
  });

  it('should have role property', () => {
    const userAccount = new UserAccount();
    userAccount.role = UserRole.ADMIN;

    expect(userAccount).toHaveProperty('role');
    expect(userAccount.role).toBe(UserRole.ADMIN);
  });

  it('should support all user roles', () => {
    const student = new UserAccount();
    student.role = UserRole.STUDENT;
    expect(student.role).toBe(UserRole.STUDENT);

    const instructor = new UserAccount();
    instructor.role = UserRole.INSTRUCTOR;
    expect(instructor.role).toBe(UserRole.INSTRUCTOR);

    const admin = new UserAccount();
    admin.role = UserRole.ADMIN;
    expect(admin.role).toBe(UserRole.ADMIN);
  });
});
