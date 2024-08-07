import { Provider, Scope } from '@nestjs/common';
import {
  CustomLoggerModuleOptionsToken,
  CustomLoggerServiceToken,
} from './custom-logger.constants';
import { CustomLoggerModuleOptions } from './custom-logger.interface';
import { CustomLoggerService } from './custom-logger.service';

export function createCustomLoggerProvider(): Provider {
  return {
    provide: CustomLoggerServiceToken,
    useFactory: (options: CustomLoggerModuleOptions) => {
      return new CustomLoggerService(options);
    },
    inject: [CustomLoggerModuleOptionsToken],
    scope: Scope.TRANSIENT,
  };
}
