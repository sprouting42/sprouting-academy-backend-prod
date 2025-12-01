import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Scope,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

import { LogLevel } from '@/enums/log.enum';
import { AppLoggerService } from '@/modules/logger/services/app-logger.service';

@Injectable({ scope: Scope.REQUEST })
export class PrismaDatabase
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly appLoggerService: AppLoggerService) {
    super({
      log: [
        { level: LogLevel.QUERY, emit: 'event' },
        { level: LogLevel.INFO, emit: 'event' },
        { level: LogLevel.WARN, emit: 'event' },
        { level: LogLevel.ERROR, emit: 'event' },
      ],
    } as Prisma.PrismaClientOptions);

    this.$on(LogLevel.QUERY as never, (e: Prisma.QueryEvent) =>
      appLoggerService.log(
        'Prisma Query',
        `Query: ${e.query} Duration: ${e.duration}ms`,
      ),
    );

    this.$on(LogLevel.ERROR as never, (e: object) =>
      appLoggerService.error('Prisma Error', `${JSON.stringify(e)}`),
    );
  }

  async onModuleInit(): Promise<void> {
    await (this.$connect as () => Promise<void>)();
  }

  async onModuleDestroy(): Promise<void> {
    await (this.$disconnect as () => Promise<void>)();
  }
}
