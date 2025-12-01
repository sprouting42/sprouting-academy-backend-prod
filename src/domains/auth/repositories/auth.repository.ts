import { Injectable } from '@nestjs/common';

import { CreateUserInput } from '@/domains/auth/repositories/dto/auth.repository.dto';
import type { IAuthRepository } from '@/domains/auth/repositories/interfaces/auth.repository.interface';
import { UserDto } from '@/infrastructures/database/dto/user.dto';
import { UserRole } from '@/infrastructures/database/enums/user-role';
import { UserRepository } from '@/infrastructures/database/repositories/user.repository';

@Injectable()
export class AuthRepository implements IAuthRepository {
  static readonly TOKEN = Symbol('AuthRepository');
  constructor(private readonly userRepository: UserRepository) {}

  findUserById(userId: string): Promise<UserDto | null> {
    return this.userRepository.findOneById(userId);
  }

  async findUserByEmail(email: string): Promise<UserDto | null> {
    const users = await this.userRepository.findMany({
      where: { email },
    });

    return users.length > 0 ? (users[0] ?? null) : null;
  }

  async createUser(input: CreateUserInput): Promise<UserDto> {
    const now = new Date();
    return this.userRepository.createWithId(
      {
        id: input.id,
        email: input.email,
        fullName: input.fullName,
        phone: input.phone ?? null,
        avatarUrl: null,
        role: UserRole.STUDENT,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      input.id, // createdBy = userId (self-created)
    );
  }
}
