import { DynamicModule, Global, Module } from '@nestjs/common';
import { LoggerService } from './logger/logger.service';
import { WinstonService } from '@app/logger/winston/winston.service';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../apps/gateway/src/settings/configuration/configuration';
import { AsyncLocalStorageService } from '@app/logger/als/als.service';

@Global()
@Module({})
export class LoggerModule {
  static forRoot(serviceName: string): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        LoggerService,
        AsyncLocalStorageService,
        {
          provide: WinstonService,
          useFactory: (
            configService: ConfigService<ConfigurationType, true>,
          ) => {
            return new WinstonService(configService, serviceName);
          },
          inject: [ConfigService],
        },
      ],
      exports: [LoggerService],
    };
  }
}
