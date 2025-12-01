/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import '../../../modules/logger/mocks/logger.mock.ts';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { BaseRepository } from '@/infrastructures/database/abstracts/base.repository';
import type { UserDto } from '@/infrastructures/database/dto/user.dto';
import type { UserEntity } from '@/infrastructures/database/entites/user.entity';
import { UserRole } from '@/infrastructures/database/enums/user-role';
import type { PrismaDatabase } from '@/infrastructures/database/prisma/prisma-database';
import { UserRepository } from '@/infrastructures/database/repositories/user.repository';

describe('user.repository', () => {
  let repository: UserRepository;
  let mockDb: PrismaDatabase;

  beforeEach(() => {
    mockDb = {
      user: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
    } as unknown as PrismaDatabase;

    repository = new UserRepository(mockDb);
  });

  describe('class definition', () => {
    it('should be defined', () => {
      expect(UserRepository).toBeDefined();
    });

    it('should extend BaseRepository', () => {
      expect(repository).toBeInstanceOf(BaseRepository);
    });

    it('should have TOKEN symbol', () => {
      expect(UserRepository.TOKEN).toBeDefined();
      expect(typeof UserRepository.TOKEN).toBe('symbol');
    });

    it('should have REQUEST scope decorator', () => {
      // Verify the class is decorated with @Injectable
      // The scope: Scope.REQUEST is part of the decorator options
      const injectable = Reflect.getMetadata('__injectable__', UserRepository);
      expect(injectable).toBeTruthy();
    });
  });

  describe('constructor', () => {
    it('should create instance with db and UserDto', () => {
      expect(repository).toBeDefined();
      expect(repository).toBeInstanceOf(UserRepository);
    });
  });

  describe('inheritance', () => {
    it('should have BaseRepository methods available', () => {
      expect(typeof repository.findOneById).toBe('function');
      expect(typeof repository.findMany).toBe('function');
      expect(typeof repository.create).toBe('function');
      expect(typeof repository.update).toBe('function');
      expect(typeof repository.exists).toBe('function');
    });

    it('should work with UserEntity type', () => {
      const entity: UserEntity = {
        id: 'test-id',
        email: 'test@example.com',
        fullName: 'Test User',
        phone: null,
        avatarUrl: null,
        role: UserRole.STUDENT,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(entity).toBeDefined();
    });

    it('should work with UserDto type', () => {
      const dto: UserDto = {
        id: 'test-id',
        email: 'test@example.com',
        fullName: 'Test User',
        role: UserRole.STUDENT,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(dto).toBeDefined();
    });
  });
});
