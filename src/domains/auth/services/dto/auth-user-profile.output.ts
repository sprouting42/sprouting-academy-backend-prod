import type { UserRole } from '@/infrastructures/database/enums/user-role';

type RequiredUserFields = Pick<
  AuthUserProfileOutput,
  'id' | 'email' | 'fullName' | 'role'
>;

export class AuthUserProfileOutput {
  readonly id: string;
  readonly email: string;
  readonly fullName: string;
  readonly phone: string | null;
  readonly avatarUrl: string | null;
  readonly role: UserRole;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: AuthUserProfileOutput) {
    Object.assign(this, props);
  }

  static create(
    input: RequiredUserFields & Partial<AuthUserProfileOutput>,
  ): AuthUserProfileOutput {
    return new AuthUserProfileOutput({
      id: input.id,
      email: input.email,
      fullName: input.fullName,
      role: input.role,
      phone: input.phone ?? null,
      avatarUrl: input.avatarUrl ?? null,
      isActive: input.isActive ?? true,
      createdAt: input.createdAt ?? new Date(),
      updatedAt: input.updatedAt ?? new Date(),
    });
  }
}
