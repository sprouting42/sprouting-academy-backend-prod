import type { UserRole } from '@/infrastructures/database/enums/user-role';

export class UserAccount {
  userId: string;
  email: string;
  role: UserRole;
}
