import { Provider } from '@nestjs/common';
import { RequestsServiceToken } from './requests.constants';
import { RequestsModuleOptions } from './requests.interface';
import { getRequestsModuleOptions } from './utils';

export function createRequestsProvider(
  options: RequestsModuleOptions,
): Provider {
  return {
    provide: RequestsServiceToken,
    useValue: getRequestsModuleOptions(options),
  };
}
