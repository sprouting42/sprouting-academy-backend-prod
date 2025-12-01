import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';
import type { Request } from 'express';

import type { UserAccount } from '@/infrastructures/database/dto/user-account.dto';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserAccount => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user as UserAccount;
  },
);
