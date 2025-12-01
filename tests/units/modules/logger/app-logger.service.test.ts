import './mocks/logger.mock';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Logger } from 'winston';

import { LogLevel } from '@/enums/log.enum';
import { AppLoggerService } from '@/modules/logger/services/app-logger.service';

import { createMockLogger } from './mocks/logger.mock';

describe('AppLoggerService', () => {
  let service: AppLoggerService;
  let mockLogger: Logger;

  beforeEach(() => {
    mockLogger = createMockLogger();

    service = new AppLoggerService(mockLogger);
  });

  describe('log', () => {
    it('should call winston logger.log with INFO level and message', () => {
      service.log('test message');

      expect(mockLogger.log).toHaveBeenCalledWith(
        LogLevel.INFO,
        'test message',
        {
          context: undefined,
        },
      );
    });

    it('should call winston logger.log with INFO level, message, and context', () => {
      service.log('test message', 'TestContext');

      expect(mockLogger.log).toHaveBeenCalledWith(
        LogLevel.INFO,
        'test message',
        {
          context: 'TestContext',
        },
      );
    });
  });

  describe('error', () => {
    it('should call winston logger.error with message only', () => {
      service.error('error message');

      expect(mockLogger.error).toHaveBeenCalledWith('error message', {
        context: undefined,
        trace: undefined,
      });
    });

    it('should call winston logger.error with message and trace', () => {
      service.error('error message', 'stack trace');

      expect(mockLogger.error).toHaveBeenCalledWith('error message', {
        context: undefined,
        trace: 'stack trace',
      });
    });

    it('should call winston logger.error with message, trace, and context', () => {
      service.error('error message', 'stack trace', 'ErrorContext');

      expect(mockLogger.error).toHaveBeenCalledWith('error message', {
        context: 'ErrorContext',
        trace: 'stack trace',
      });
    });
  });

  describe('warn', () => {
    it('should call winston logger.warn with message only', () => {
      service.warn('warning message');

      expect(mockLogger.warn).toHaveBeenCalledWith('warning message', {
        context: undefined,
      });
    });

    it('should call winston logger.warn with message and context', () => {
      service.warn('warning message', 'WarnContext');

      expect(mockLogger.warn).toHaveBeenCalledWith('warning message', {
        context: 'WarnContext',
      });
    });
  });

  describe('debug', () => {
    it('should call winston logger.debug with message only', () => {
      service.debug('debug message');

      expect(mockLogger.debug).toHaveBeenCalledWith('debug message', {
        context: undefined,
      });
    });

    it('should call winston logger.debug with message and context', () => {
      service.debug('debug message', 'DebugContext');

      expect(mockLogger.debug).toHaveBeenCalledWith('debug message', {
        context: 'DebugContext',
      });
    });
  });

  describe('verbose', () => {
    it('should call winston logger.verbose with message only', () => {
      service.verbose('verbose message');

      expect(mockLogger.verbose).toHaveBeenCalledWith('verbose message', {
        context: undefined,
      });
    });

    it('should call winston logger.verbose with message and context', () => {
      service.verbose('verbose message', 'VerboseContext');

      expect(mockLogger.verbose).toHaveBeenCalledWith('verbose message', {
        context: 'VerboseContext',
      });
    });
  });

  describe('getContext', () => {
    it('should create service instance', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(AppLoggerService);
    });
  });
});
