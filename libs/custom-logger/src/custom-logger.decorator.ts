import { Inject } from '@nestjs/common';
import { CustomLoggerServiceToken } from './custom-logger.constants';

export function InjectCustomLoggerService() {
  return Inject(CustomLoggerServiceToken);
}
