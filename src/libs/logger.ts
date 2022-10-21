import { ConsoleLogger } from '@nestjs/common';
import * as winston from 'winston';
import * as fs from 'fs/promises';
import { join } from 'path';

export class Logger extends ConsoleLogger {
  logger: winston.Logger;

  constructor() {
    super();
    this.init().catch();
  }

  async init() {
    const logsDir: string = join(__dirname, '../../logs');
    try {
      await fs.readdir(logsDir);
    } catch {
      await fs.mkdir(logsDir);
    }
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      defaultMeta: { service: 'user-service' },
      transports: [
        new winston.transports.File({
          filename: 'logs/errors.log',
          level: 'error',
        }),
      ],
    });
  }

  error(message: any, stack?: string, context?: string) {
    super.error(message, stack, context);
    this.logger.error(message);
  }
}
