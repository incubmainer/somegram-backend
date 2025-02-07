import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  CREATE_NOTIFICATION,
  CREATE_NOTIFICATIONS,
  SEND_SUBSCRIPTION_INFO,
  SEND_SUBSCRIPTIONS_INFO,
} from '../../../../gateway/src/common/constants/service.constants';
import {
  NOTIFICATION_DELAY_SERVICE_RMQ,
  NOTIFICATION_SERVICE_RMQ,
  PAYMENTS_SERVICE_RMQ,
} from '../constants/adapters-name.constant';
import { SubscriptionInfoGatewayType } from '../../../../gateway/src/features/subscriptions/domain/types';
import { CreateNotificationInputDto } from '../../../../gateway/src/features/notification/api/dto/input-dto/notification.input-dto';

@Injectable()
export class GatewayServiceClientAdapter {
  constructor(
    @Inject(PAYMENTS_SERVICE_RMQ)
    private readonly gatewayServiceClient: ClientProxy,
    @Inject(NOTIFICATION_SERVICE_RMQ)
    private readonly notificationGatewayServiceClient: ClientProxy,
    @Inject(NOTIFICATION_DELAY_SERVICE_RMQ)
    private readonly notificationDelayGatewayServiceClient: ClientProxy,
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

  async createSubscriptionNotification(
    payload: CreateNotificationInputDto,
  ): Promise<void> {
    this.notificationGatewayServiceClient.emit(
      { cmd: CREATE_NOTIFICATION },
      payload,
    );
  }

  async createSubscriptionNotifications(
    payload: CreateNotificationInputDto[],
  ): Promise<void> {
    this.notificationGatewayServiceClient.emit(
      { cmd: CREATE_NOTIFICATIONS },
      payload,
    );
  }

  async createSubscriptionNotificationWithDelay(
    payload: CreateNotificationInputDto,
  ): Promise<void> {
    this.notificationDelayGatewayServiceClient.emit(
      { cmd: CREATE_NOTIFICATION },
      payload,
    );
  }
}
