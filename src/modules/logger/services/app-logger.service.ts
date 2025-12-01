import { Injectable, LoggerService, Inject, Scope } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { LogLevel } from '@/enums/log.enum';

@Injectable({ scope: Scope.DEFAULT })
export class AppLoggerService implements LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  private getContext(context?: string) {
    return { context };
  }

  log(message: string, context?: string) {
    this.logger.log(LogLevel.INFO, message, this.getContext(context));
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { ...this.getContext(context), trace });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, this.getContext(context));
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, this.getContext(context));
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, this.getContext(context));
  }
}
