import { SetMetadata } from '@nestjs/common';

import type { UserRole } from '@/infrastructures/database/enums/user-role';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for a route
 * @example
 * @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
 * @Get('admin-only')
 * adminOnly() { return 'admin'; }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
