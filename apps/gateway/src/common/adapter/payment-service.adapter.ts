import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import {
  CREATE_PAYMENT,
  STRIPE_WEBHOOK_HANDLER,
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
    userId: string;
    createSubscriptionDto: CreateSubscriptionDto;
  }) {
    try {
      const responseOfService = this.paymentsServiceClient
        .send({ cmd: CREATE_PAYMENT }, { payload })
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
}