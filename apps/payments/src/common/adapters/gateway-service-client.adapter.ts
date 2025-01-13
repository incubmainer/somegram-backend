import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SEND_SUBSCRIPTION_INFO } from '../../../../gateway/src/common/constants/service.constants';
import { PAYMENTS_SERVICE_RMQ } from '../constants/adapters-name.constant';

@Injectable()
export class GatewayServiceClientAdapter {
  constructor(
    @Inject(PAYMENTS_SERVICE_RMQ)
    private readonly gatewayServiceClient: ClientProxy,
  ) {}

  async sendSubscriptionInfo(payload: any) {
    return this.gatewayServiceClient.emit(
      { cmd: SEND_SUBSCRIPTION_INFO },
      { payload },
    );
  }
}
