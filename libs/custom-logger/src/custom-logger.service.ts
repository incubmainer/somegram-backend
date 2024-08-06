import * as winston from 'winston';
import * as Transport from 'winston-transport';

import { Inject, Injectable, Scope } from '@nestjs/common';
import { CustomLoggerModuleOptions } from './custom-logger.interface';
import { CustomLoggerModuleOptionsToken } from './custom-logger.constants';
const { combine, prettyPrint, errors, colorize } = winston.format;

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLoggerService {
  private logger: winston.Logger;
  private className?: string;

  constructor(
    @Inject(CustomLoggerModuleOptionsToken)
    private readonly options: CustomLoggerModuleOptions,
  ) {
    const transports: Transport[] = [];

    if (options.console.enable) {
      const consoleTransport = new winston.transports.Console({
        format: combine(
          errors({ stack: true }),
          prettyPrint(),
          colorize({ all: true, colors: { trace: options.console.color } }),
        ),
      });
      transports.push(consoleTransport);
    }

    if (options.http.enable) {
      const httpTransport = new winston.transports.Http({
        host: options.http.host,
        path: options.http.url,
        ssl: options.http.ssl,
      });

      transports.push(httpTransport);
    }

    this.logger = winston.createLogger({
      level: options.loggerLevel,
      levels: options.levels,
      transports: transports,
    });
  }
  setClassName(className: string) {
    this.className = className;
  }
  log(level: string, message: string, meta?: Record<string, any>) {
    const resultMeta = {
      className: this.className || undefined,
      ...meta,
    };

    if (this.options.additionalFields) {
      for (const [key, value] of Object.entries(
        this.options.additionalFields,
      )) {
        resultMeta[key] = value();
      }
    }

    const result = {
      level,
      message,
      ...resultMeta,
    };

    this.logger.log(result);
  }
}
