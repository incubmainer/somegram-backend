import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { CreateSubscriptionDto } from '../../features/subscriptions/api/dto/input-dto/create-subscription.dto';
import {
  CREATE_AUTO_PAYMENT,
  DISABLE_AUTO_RENEWAL,
  ENABLE_AUTO_RENEWAL,
  GET_PAYMENTS,
  PAYPAL_WEBHOOK_HANDLER,
  STRIPE_WEBHOOK_HANDLER,
} from '../constants/service.constants';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';

@Injectable()
export class PaymentsServiceAdapter {
  constructor(
    @Inject('PAYMENTS_SERVICE')
    private readonly paymentsServiceClient: ClientProxy,
    private readonly configService: ConfigService,
    private readonly appNotification: ApplicationNotification,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PaymentsServiceAdapter.name);
  }

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
      throw new InternalServerErrorException();
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
      throw new InternalServerErrorException();
    }
  }

  async paypalWebhook(payload: {
    rawBody: Buffer;
    headers: Headers;
  }): Promise<AppNotificationResultType<null>> {
    try {
      const responseOfService = this.paymentsServiceClient
        .send({ cmd: PAYPAL_WEBHOOK_HANDLER }, { payload })
        .pipe(timeout(10000));
      await firstValueFrom(responseOfService);

      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.paypalWebhook.name);
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
      throw new InternalServerErrorException();
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
      throw new InternalServerErrorException();
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
      throw new InternalServerErrorException();
    }
  }
}
