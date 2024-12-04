import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import {
  DISABLE_AUTO_RENEWAL,
  CREATE_AUTO_PAYMENT,
  STRIPE_WEBHOOK_HANDLER,
  ENABLE_AUTO_RENEWAL,
  GET_PAYMENTS,
} from '../config/constants/service.constants';
import { CreateSubscriptionDto } from '../../features/subscriptions/api/dto/input-dto/create-subscription.dto';

@Injectable()
export class PaymentsServiceAdapter {
  constructor(
    @Inject('PAYMENTS_SERVICE')
    private readonly paymentsServiceClient: ClientProxy,
    private readonly configService: ConfigService,
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
