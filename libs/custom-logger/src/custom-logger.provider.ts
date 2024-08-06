import { Provider } from '@nestjs/common';
import { CustomLoggerServiceToken } from './custom-logger.constants';
import { CustomLoggerModuleOptions } from './custom-logger.interface';
import { getCustomLoggerModuleOptions } from './utils';

export function createCustomLoggerProvider(
  options: CustomLoggerModuleOptions,
): Provider {
  return {
    provide: CustomLoggerServiceToken,
    useValue: getCustomLoggerModuleOptions(options),
  };
}
