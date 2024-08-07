import * as winston from 'winston';
import * as Transport from 'winston-transport';

import { Inject } from '@nestjs/common';
import { CustomLoggerModuleOptions } from './custom-logger.interface';
import { CustomLoggerModuleOptionsToken } from './custom-logger.constants';
import {
  customLoggerDefaultLabel,
  defaultTimeFormat,
} from './custom-logger.default';

const { combine, colorize, label, printf, timestamp } = winston.format;

export class CustomLoggerService {
  private logger: winston.Logger;
  private context?: string;

  constructor(
    @Inject(CustomLoggerModuleOptionsToken)
    private readonly options: CustomLoggerModuleOptions,
  ) {
    const transports: Transport[] = [];

    if (options.console.enable) {
      const customFormat = printf(
        ({ level, message, label, timestamp, ...additionalFields }) => {
          const mainPart = `${timestamp} [${label}] ${level}: ${message}\n`;
          const secondaryPartObject = {};
          Object.keys(additionalFields).forEach((key) => {
            if (additionalFields[key] !== undefined) {
              secondaryPartObject[key] = additionalFields[key];
            }
          });

          const secondaryPart = JSON.stringify(secondaryPartObject, null, 2);

          return mainPart + secondaryPart;
        },
      );
      const consoleTransport = new winston.transports.Console({
        format: combine(
          colorize({
            all: true,
            colors: {
              trace: 'magenta',
              debug: 'blue',
              info: 'green',
              warn: 'yellow',
              error: 'red',
              fatal: 'bold red',
            },
          }),
          label({
            label: options.label ? options.label : customLoggerDefaultLabel,
          }),
          timestamp({
            format: options.timeFormat ? options.timeFormat : defaultTimeFormat,
          }),
          customFormat,
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
      levels: {
        trace: 5,
        debug: 4,
        info: 3,
        warn: 2,
        error: 1,
        fatal: 0,
      },
      transports: transports,
    });
  }
  log(level: string, message: string, meta?: Record<string, any>) {
    const resultMeta = {
      context: this.context || undefined,
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
  setContext(context: string): void {
    this.context = context;
  }

  // private getStack(error: any): string | undefined {
  //   const stack = error?.stack;
  //
  //   if (stack) {
  //     return `${stack?.split('\n')[1]}`;
  //   }
  // }
  //
  // trace(message: string, functionName?: string) {
  //   super.verbose(message, this.getSourceContext() || functionName);
  //
  //   this.winstonLogger.trace(
  //     message,
  //     this.getRequestId(),
  //     functionName,
  //     this.getSourceContext(),
  //   );
  // }
  //
  // debug(message: string, functionName?: string) {
  //   super.debug(message, this.getSourceContext() || functionName);
  //
  //   this.winstonLogger.debug(
  //     message,
  //     this.getRequestId(),
  //     functionName,
  //     this.getSourceContext(),
  //   );
  // }
  //
  // log(message: string, functionName?: string) {
  //   super.log(message, this.getSourceContext() || functionName);
  //
  //   this.winstonLogger.info(
  //     message,
  //     this.getRequestId(),
  //     functionName,
  //     this.getSourceContext(),
  //   );
  // }
  //
  // warn(message: string, functionName?: string) {
  //   super.warn(message, this.getSourceContext() || functionName);
  //
  //   this.winstonLogger.warn(
  //     message,
  //     this.getRequestId(),
  //     functionName,
  //     this.getSourceContext(),
  //   );
  // }
  //
  // error(error: any, functionName?: string) {
  //   const jsonError = error instanceof Error ? JSON.stringify(error) : error;
  //   const stack = this.getStack(error);
  //
  //   const fullErrorMessage = `${
  //     error?.message ? `msg: ${error?.message}; ` : ''
  //   } fullError: ${jsonError}`;
  //
  //   super.error(error, stack, this.getSourceContext() || functionName);
  //
  //   this.winstonLogger.error(
  //     fullErrorMessage,
  //     this.getRequestId(),
  //     functionName,
  //     this.getSourceContext(),
  //     stack,
  //   );
  // }
  //
  // fatal(message: string, functionName?: string, stack?: string) {
  //   super.fatal(message, this.getSourceContext() || functionName);
  //
  //   this.winstonLogger.fatal(
  //     message,
  //     this.getRequestId(),
  //     functionName,
  //     this.getSourceContext(),
  //     stack,
  //   );
  // }
}
