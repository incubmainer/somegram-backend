import { RequestsModuleOptions } from './requests.interface';
import { RequestsService } from './requests.service';

export const getRequestsModuleOptions = (
  options: RequestsModuleOptions,
): RequestsService => new RequestsService(options);
