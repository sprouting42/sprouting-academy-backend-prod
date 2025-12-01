import * as winston from 'winston';

import { LogLevel } from '@/enums/log.enum';

const loggerConfig = {
  console: {
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.colorize(),
      winston.format.simple(),
    ),
  },
  file: {
    error: {
      filename: 'logs/error.log',
      level: LogLevel.ERROR,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    },
    combined: {
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    },
  },
};

export const winstonTransports = [
  new winston.transports.Console(loggerConfig.console),
  new winston.transports.File(loggerConfig.file.error),
  new winston.transports.File(loggerConfig.file.combined),
];
