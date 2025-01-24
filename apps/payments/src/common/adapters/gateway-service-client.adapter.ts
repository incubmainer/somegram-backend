import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  SEND_SUBSCRIPTION_INFO,
  SEND_SUBSCRIPTIONS_INFO,
} from '../../../../gateway/src/common/constants/service.constants';
import { PAYMENTS_SERVICE_RMQ } from '../constants/adapters-name.constant';
import { SubscriptionInfoGatewayType } from '../../../../gateway/src/features/subscriptions/domain/types';

@Injectable()
export class GatewayServiceClientAdapter {
  constructor(
    @Inject(PAYMENTS_SERVICE_RMQ)
    private readonly gatewayServiceClient: ClientProxy,
  ) {}

  async sendSubscriptionInfo(
    payload: SubscriptionInfoGatewayType,
  ): Promise<void> {
    this.gatewayServiceClient.emit({ cmd: SEND_SUBSCRIPTION_INFO }, payload);
  }

  async sendSubscriptionsInfo(
    payload: SubscriptionInfoGatewayType[],
  ): Promise<void> {
    this.gatewayServiceClient.emit({ cmd: SEND_SUBSCRIPTIONS_INFO }, payload);
  }
}
