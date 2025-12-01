/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';
import { UserAccount } from '@/infrastructures/database/dto/user-account.dto';
import type { ISupabaseManager } from '@/infrastructures/supabase/interfaces/supabase.service.interface';
import { SupabaseManager } from '@/infrastructures/supabase/services/supabase.manager';
import { AppLoggerService } from '@/modules/logger/services/app-logger.service';

declare module 'express' {
  interface Request {
    user?: UserAccount;
  }
}

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    @Inject(SupabaseManager.TOKEN)
    private readonly supabaseManager: ISupabaseManager,
    private readonly reflector: Reflector,
    private readonly logger: AppLoggerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (token === undefined || token === '') {
      throw new UnauthorizedException('Access token is required');
    }

    try {
      const {
        data: { user },
        error,
      } = await this.supabaseManager.getUserFromToken(token);

      if (
        (error !== undefined && error !== null) ||
        user === null ||
        user === undefined
      ) {
        this.logger.error(
          'Token verification failed',
          error?.message ?? 'Unknown error',
        );
        throw new UnauthorizedException('Invalid or expired token');
      }

      request.user = {
        userId: user.id,
        email: user.email,
        role: user.user_metadata?.role,
      } as UserAccount;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
