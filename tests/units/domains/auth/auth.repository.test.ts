import { describe, it, expect, beforeEach, vi } from 'vitest';

import { AuthRepository } from '@/domains/auth/repositories/auth.repository';
import type { CreateUserInput } from '@/domains/auth/repositories/dto/auth.repository.dto';
import type { UserDto } from '@/infrastructures/database/dto/user.dto';
import { UserRole } from '@/infrastructures/database/enums/user-role';
import type { UserRepository } from '@/infrastructures/database/repositories/user.repository';

describe('AuthRepository', () => {
  let authRepository: AuthRepository;
  let mockUserRepository: Partial<UserRepository>;

  const mockUser: UserDto = {
    id: 'user-123',
    email: 'test@example.com',
    fullName: 'Test User',
    phone: '0812345678',
    avatarUrl: undefined,
    role: UserRole.STUDENT,
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  beforeEach(() => {
    mockUserRepository = {
      findOneById: vi.fn(),
      findMany: vi.fn(),
      createWithId: vi.fn(),
    };

    authRepository = new AuthRepository(mockUserRepository as UserRepository);
  });

  describe('findUserById', () => {
    it('should find user by id successfully', async () => {
      vi.spyOn(mockUserRepository, 'findOneById').mockResolvedValue(mockUser);

      const result = await authRepository.findUserById('user-123');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOneById).toHaveBeenCalledWith('user-123');
    });

    it('should return null when user not found', async () => {
      vi.spyOn(mockUserRepository, 'findOneById').mockResolvedValue(null);

      const result = await authRepository.findUserById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findUserByEmail', () => {
    it('should find user by email successfully', async () => {
      vi.spyOn(mockUserRepository, 'findMany').mockResolvedValue([mockUser]);

      const result = await authRepository.findUserByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findMany).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when no user found with email', async () => {
      vi.spyOn(mockUserRepository, 'findMany').mockResolvedValue([]);

      const result = await authRepository.findUserByEmail(
        'notfound@example.com',
      );

      expect(result).toBeNull();
    });

    it('should return first user when multiple users found', async () => {
      const users = [mockUser, { ...mockUser, id: 'user-456' }];
      vi.spyOn(mockUserRepository, 'findMany').mockResolvedValue(users);

      const result = await authRepository.findUserByEmail('test@example.com');

      expect(result).toEqual(mockUser);
    });

    it('should handle array with undefined first element gracefully', async () => {
      // Create an array with a hole at position 0 to test the ?? null fallback
      const sparseArray: UserDto[] = [];
      sparseArray[1] = mockUser;
      vi.spyOn(mockUserRepository, 'findMany').mockResolvedValue(sparseArray);

      const result = await authRepository.findUserByEmail('test@example.com');

      // Should return null because users[0] is undefined
      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create user successfully with all fields', async () => {
      const input: CreateUserInput = {
        id: 'new-user-123',
        email: 'new@example.com',
        fullName: 'New User',
        phone: '0899999999',
      };

      vi.spyOn(mockUserRepository, 'createWithId').mockResolvedValue({
        ...mockUser,
        id: input.id,
        email: input.email,
        fullName: input.fullName,
        phone: input.phone,
      });

      const result = await authRepository.createUser(input);

      expect(result.id).toBe(input.id);
      expect(result.email).toBe(input.email);
      expect(result.fullName).toBe(input.fullName);
      expect(result.phone).toBe(input.phone);
      expect(result.role).toBe(UserRole.STUDENT);
      expect(result.isActive).toBe(true);
      expect(mockUserRepository.createWithId).toHaveBeenCalled();
    });

    it('should create user with null phone when not provided', async () => {
      const input: CreateUserInput = {
        id: 'new-user-123',
        email: 'new@example.com',
        fullName: 'New User',
      };

      vi.spyOn(mockUserRepository, 'createWithId').mockResolvedValue({
        ...mockUser,
        id: input.id,
        email: input.email,
        fullName: input.fullName,
        phone: undefined,
      });

      const result = await authRepository.createUser(input);

      expect(result.phone).toBeUndefined();
    });

    it('should call createWithId with correct parameters', async () => {
      const input: CreateUserInput = {
        id: 'new-user-123',
        email: 'new@example.com',
        fullName: 'New User',
      };

      vi.spyOn(mockUserRepository, 'createWithId').mockResolvedValue({
        ...mockUser,
        id: input.id,
      });

      await authRepository.createUser(input);

      expect(mockUserRepository.createWithId).toHaveBeenCalledWith(
        expect.objectContaining({
          id: input.id,
          email: input.email,
          fullName: input.fullName,
        }),
        input.id,
      );
    });

    it('should set default values correctly', async () => {
      const input: CreateUserInput = {
        id: 'new-user-123',
        email: 'new@example.com',
        fullName: 'New User',
      };

      vi.spyOn(mockUserRepository, 'createWithId').mockResolvedValue({
        ...mockUser,
        id: input.id,
        avatarUrl: undefined,
        role: UserRole.STUDENT,
        isActive: true,
      });

      const result = await authRepository.createUser(input);

      expect(result.avatarUrl).toBeUndefined();
      expect(result.role).toBe(UserRole.STUDENT);
      expect(result.isActive).toBe(true);
    });
  });

  describe('TOKEN', () => {
    it('should have a unique TOKEN symbol', () => {
      expect(AuthRepository.TOKEN).toBeTypeOf('symbol');
      expect(AuthRepository.TOKEN.toString()).toBe('Symbol(AuthRepository)');
    });
  });
});
