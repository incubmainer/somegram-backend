import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable, timeout } from 'rxjs';
import {
  CREATE_AUTO_PAYMENT,
  DISABLE_AUTO_RENEWAL,
  ENABLE_AUTO_RENEWAL,
  GET_PAYMENTS,
  GET_PAYMENTS_BY_USERS,
  GET_SUBSCRIPTION_INFO,
  PAYPAL_WEBHOOK_HANDLER,
  STRIPE_WEBHOOK_HANDLER,
  TESTING_CANCEL_SUBSCRIPTION,
  TESTING_GET_NOTIFICATION,
  TESTING_GET_PAYMENTS,
} from '../constants/service.constants';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { SearchQueryParametersType } from '../domain/query.types';
import {
  CreatePaymentDto,
  GetUserPaymentPayloadType,
  PayPalRawBodyPayloadType,
  StripeRawBodyPayloadType,
} from '../../features/subscriptions/domain/types';
import {
  MyPaymentsOutputDto,
  SubscriptionInfoOutputDto,
} from '../../features/subscriptions/api/dto/output-dto/subscriptions.output-dto';
import { Pagination } from '@app/paginator';

@Injectable()
export class PaymentsServiceAdapter {
  constructor(
    @Inject('PAYMENTS_SERVICE')
    private readonly paymentsServiceClient: ClientProxy,
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
          .pipe(timeout(20000));
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

  async disableAutoRenewal(
    payload: string,
  ): Promise<AppNotificationResultType<null>> {
    try {
      const responseOfService: Observable<AppNotificationResultType<null>> =
        this.paymentsServiceClient
          .send({ cmd: DISABLE_AUTO_RENEWAL }, payload)
          .pipe(timeout(10000));

      return await firstValueFrom(responseOfService);
    } catch (e) {
      this.logger.error(e, this.disableAutoRenewal.name);
      return this.appNotification.internalServerError();
    }
  }

  async enableAutoRenewal(
    payload: string,
  ): Promise<AppNotificationResultType<null>> {
    try {
      const responseOfService: Observable<AppNotificationResultType<null>> =
        this.paymentsServiceClient
          .send({ cmd: ENABLE_AUTO_RENEWAL }, payload)
          .pipe(timeout(10000));

      return await firstValueFrom(responseOfService);
    } catch (e) {
      this.logger.error(e, this.enableAutoRenewal.name);
      return this.appNotification.internalServerError();
    }
  }

  async getPayments(
    payload: GetUserPaymentPayloadType,
  ): Promise<AppNotificationResultType<Pagination<MyPaymentsOutputDto[]>>> {
    try {
      const responseOfService: Observable<
        AppNotificationResultType<Pagination<MyPaymentsOutputDto[]>>
      > = this.paymentsServiceClient
        .send({ cmd: GET_PAYMENTS }, payload)
        .pipe(timeout(10000));

      return await firstValueFrom(responseOfService);
    } catch (e) {
      this.logger.error(e, this.getPayments.name);
      return this.appNotification.internalServerError();
    }
  }

  async getSubscriptionInfo(
    payload: string,
  ): Promise<AppNotificationResultType<SubscriptionInfoOutputDto>> {
    try {
      const responseOfService: Observable<
        AppNotificationResultType<SubscriptionInfoOutputDto>
      > = this.paymentsServiceClient
        .send({ cmd: GET_SUBSCRIPTION_INFO }, payload)
        .pipe(timeout(10000));

      return await firstValueFrom(responseOfService);
    } catch (e) {
      this.logger.error(e, this.getSubscriptionInfo.name);
      return this.appNotification.internalServerError();
    }
  }

  async testingCancelSubscription(
    payload: string,
  ): Promise<AppNotificationResultType<null>> {
    try {
      const responseOfService: Observable<AppNotificationResultType<null>> =
        this.paymentsServiceClient
          .send({ cmd: TESTING_CANCEL_SUBSCRIPTION }, payload)
          .pipe(timeout(10000));

      return await firstValueFrom(responseOfService);
    } catch (e) {
      this.logger.error(e, this.testingCancelSubscription.name);
      return this.appNotification.internalServerError();
    }
  }

  async testingGetPayments(payload: {
    userId: string;
    queryString?: SearchQueryParametersType;
  }): Promise<AppNotificationResultType<Pagination<MyPaymentsOutputDto[]>>> {
    try {
      const responseOfService: Observable<
        AppNotificationResultType<Pagination<MyPaymentsOutputDto[]>>
      > = this.paymentsServiceClient
        .send({ cmd: TESTING_GET_PAYMENTS }, payload)
        .pipe(timeout(10000));

      return await firstValueFrom(responseOfService);
    } catch (e) {
      this.logger.error(e, this.testingGetPayments.name);
      return this.appNotification.internalServerError();
    }
  }

  async testingSendNotification(payload: {
    userId: string;
  }): Promise<AppNotificationResultType<null>> {
    try {
      const responseOfService: Observable<AppNotificationResultType<null>> =
        this.paymentsServiceClient
          .send({ cmd: TESTING_GET_NOTIFICATION }, payload)
          .pipe(timeout(10000));

      return await firstValueFrom(responseOfService);
    } catch (e) {
      this.logger.error(e, this.testingSendNotification.name);
      return this.appNotification.internalServerError();
    }
  }
  async getSubscriptionsByUserIds(payload: {
    userIds: string[];
  }): Promise<any> {
    try {
      const responseOfService: Observable<any> = this.paymentsServiceClient
        .send({ cmd: GET_PAYMENTS_BY_USERS }, payload)
        .pipe(timeout(10000));

      return await firstValueFrom(responseOfService);
    } catch (e) {
      this.logger.error(e, this.getPayments.name);
      return this.appNotification.internalServerError();
    }
  }
}
