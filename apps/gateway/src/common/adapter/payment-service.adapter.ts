import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { ConfigService } from '@nestjs/config';

import { ApplicationNotification } from '@app/application-notification';
import { CreateSubscriptionDto } from '../../features/subscriptions/api/dto/input-dto/subscriptions.dto';
import {
  CREATE_AUTO_PAYMENT,
  DISABLE_AUTO_RENEWAL,
  ENABLE_AUTO_RENEWAL,
  GET_PAYMENTS,
  STRIPE_WEBHOOK_HANDLER,
} from '../constants/service.constants';

@Injectable()
export class PaymentsServiceAdapter {
  constructor(
    @Inject('PAYMENTS_SERVICE')
    private readonly paymentsServiceClient: ClientProxy,
    private readonly configService: ConfigService,
    private readonly appNotification: ApplicationNotification,
  ) {}

  async createSubscription(payload: {
    userInfo: {
      userId: string;
      email: string;
      userName: string;
    };
    createSubscriptionDto: CreateSubscriptionDto;
  }) {
    try {
      const responseOfService = this.paymentsServiceClient
        .send({ cmd: CREATE_AUTO_PAYMENT }, { payload })
        .pipe(timeout(10000));

      const result = await firstValueFrom(responseOfService);
      return result;
    } catch (e) {
      return this.appNotification.internalServerError();
    }
  }

  async stripeWebhook(payload: { rawBody: Buffer; signatureHeader: string }) {
    try {
      const responseOfService = this.paymentsServiceClient
        .send({ cmd: STRIPE_WEBHOOK_HANDLER }, { payload })
        .pipe(timeout(10000));

      const result = await firstValueFrom(responseOfService);
      return result;
    } catch (e) {
      return this.appNotification.internalServerError();
    }
  }

  async disableAutoRenewal(payload: { userId: string }) {
    try {
      const responseOfService = this.paymentsServiceClient
        .send({ cmd: DISABLE_AUTO_RENEWAL }, { payload })
        .pipe(timeout(10000));

      const result = await firstValueFrom(responseOfService);
      return result;
    } catch (e) {
      return this.appNotification.internalServerError();
    }
  }

  async enableAutoRenewal(payload: { userId: string }) {
    try {
      const responseOfService = this.paymentsServiceClient
        .send({ cmd: ENABLE_AUTO_RENEWAL }, { payload })
        .pipe(timeout(10000));

      const result = await firstValueFrom(responseOfService);
      return result;
    } catch (e) {
      return this.appNotification.internalServerError();
    }
  }

  async getPayments(payload: { userId: string }) {
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
}
