import { Inject } from '@nestjs/common';
import { RequestsServiceToken } from './requests.constants';

export function InjectRequestsService() {
  return Inject(RequestsServiceToken);
}
