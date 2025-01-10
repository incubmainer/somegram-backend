import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable, timeout } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import {
  CREATE_AUTO_PAYMENT,
  DISABLE_AUTO_RENEWAL,
  ENABLE_AUTO_RENEWAL,
  GET_PAYMENTS,
  GET_SUBSCRIPTION_INFO,
  PAYPAL_WEBHOOK_HANDLER,
  STRIPE_WEBHOOK_HANDLER,
} from '../constants/service.constants';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { SearchQueryParametersType } from '../domain/query.types';
import {
  CreatePaymentDto,
  PayPalRawBodyPayloadType,
  StripeRawBodyPayloadType,
} from '../../features/subscriptions/domain/types';

@Injectable()
export class PaymentsServiceAdapter {
  constructor(
    @Inject('PAYMENTS_SERVICE')
    private readonly paymentsServiceClient: ClientProxy,
    private readonly configService: ConfigService,
    private readonly appNotification: ApplicationNotification,
    private readonly logger: LoggerService,
  ) {}

  async createSubscription(
    payload: CreatePaymentDto,
  ): Promise<AppNotificationResultType<string>> {
    try {
      const responseOfService: Observable<AppNotificationResultType<string>> =
        this.paymentsServiceClient
          .send({ cmd: CREATE_AUTO_PAYMENT }, payload)
          .pipe(timeout(10000));
      return await firstValueFrom(responseOfService);
    } catch (e) {
      this.logger.error(e, this.createSubscription.name);
      return this.appNotification.internalServerError();
    }
  }

  async stripeWebhook(
    payload: StripeRawBodyPayloadType,
  ): Promise<AppNotificationResultType<null>> {
    try {
      const responseOfService: Observable<AppNotificationResultType<null>> =
        this.paymentsServiceClient
          .send({ cmd: STRIPE_WEBHOOK_HANDLER }, payload)
          .pipe(timeout(10000));

      return await firstValueFrom(responseOfService);
    } catch (e) {
      this.logger.error(e, this.stripeWebhook.name);
      return this.appNotification.internalServerError();
    }
  }

  async paypalWebhook(
    payload: PayPalRawBodyPayloadType,
  ): Promise<AppNotificationResultType<null>> {
    try {
      const responseOfService: Observable<AppNotificationResultType<null>> =
        this.paymentsServiceClient
          .send({ cmd: PAYPAL_WEBHOOK_HANDLER }, payload)
          .pipe(timeout(10000));
      return await firstValueFrom(responseOfService);
    } catch (e) {
      this.logger.error(e, this.paypalWebhook.name);
      return this.appNotification.internalServerError();
    }
  }

  async disableAutoRenewal(payload: {
    userId: string;
  }): Promise<AppNotificationResultType<null>> {
    try {
      const responseOfService: Observable<AppNotificationResultType<null>> =
        this.paymentsServiceClient
          .send({ cmd: DISABLE_AUTO_RENEWAL }, { payload })
          .pipe(timeout(10000));

      return await firstValueFrom(responseOfService);
    } catch (e) {
      this.logger.error(e, this.disableAutoRenewal.name);
      return this.appNotification.internalServerError();
    }
  }

  async enableAutoRenewal(payload: {
    userId: string;
  }): Promise<AppNotificationResultType<null>> {
    try {
      const responseOfService: Observable<AppNotificationResultType<null>> =
        this.paymentsServiceClient
          .send({ cmd: ENABLE_AUTO_RENEWAL }, { payload })
          .pipe(timeout(10000));

      return await firstValueFrom(responseOfService);
    } catch (e) {
      this.logger.error(e, this.enableAutoRenewal.name);
      return this.appNotification.internalServerError();
    }
  }

  async getPayments(payload: {
    userId: string;
    queryString?: SearchQueryParametersType;
  }) {
    try {
      const responseOfService = this.paymentsServiceClient
        .send({ cmd: GET_PAYMENTS }, { payload })
        .pipe(timeout(10000));

      const result = await firstValueFrom(responseOfService);
      return result;
    } catch (e) {
      return this.appNotification.internalServerError();
    }
  }

  async getSubscriptionInfo(payload: { userId: string }) {
    try {
      const responseOfService = this.paymentsServiceClient
        .send({ cmd: GET_SUBSCRIPTION_INFO }, { payload })
        .pipe(timeout(10000));

      const result = await firstValueFrom(responseOfService);
      return result;
    } catch (e) {
      return this.appNotification.internalServerError();
    }
  }
}
