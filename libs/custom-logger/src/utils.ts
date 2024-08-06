import { CustomLoggerModuleOptions } from './custom-logger.interface';
import { CustomLoggerService } from './custom-logger.service';

export const getCustomLoggerModuleOptions = (
  options: CustomLoggerModuleOptions,
): CustomLoggerService => new CustomLoggerService(options);
