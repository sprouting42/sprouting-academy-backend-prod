import type { UserRole } from '@prisma/client';

import { BaseEntity } from '@/infrastructures/database/abstracts/base.entity';

export class UserEntity extends BaseEntity {
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  role: UserRole;
  isActive: boolean;
}
