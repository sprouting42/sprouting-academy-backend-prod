import type { CreateUserInput } from '@/domains/auth/repositories/dto/auth.repository.dto';
import type { UserDto } from '@/infrastructures/database/dto/user.dto';

export interface IAuthRepository {
  findUserById(userId: string): Promise<UserDto | null>;

  findUserByEmail(email: string): Promise<UserDto | null>;

  createUser(input: CreateUserInput): Promise<UserDto>;
}
