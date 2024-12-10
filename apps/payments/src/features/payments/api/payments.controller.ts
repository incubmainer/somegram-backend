import {
  Controller,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import {
  DISABLE_AUTO_RENEWAL,
  CREATE_AUTO_PAYMENT,
  STRIPE_WEBHOOK_HANDLER,
  ENABLE_AUTO_RENEWAL,
  GET_PAYMENTS,
  SEND_SUBSCRIPTION_INFO,
} from '../../../../../gateway/src/common/config/constants/service.constants';
import { CreatePaymentCommand } from '../application/use-cases/create-payment.use-case';
import { StripeWebhookCommand } from '../application/use-cases/stripe-webhook.use-case';
import { DisableAutoRenewalCommand } from '../application/use-cases/disable-autorenewal.use-case';
import { EnableAutoRenewalCommand } from '../application/use-cases/enable-autorenewal.use-case';
import { GetPaymentsQuery } from '../application/use-cases/get-payments.use-case';
import { firstValueFrom, timeout } from 'rxjs';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject('PAYMENTS_SERVICE_RMQ')
    private readonly paymentsServiceClient: ClientProxy,
  ) {}

  @MessagePattern({ cmd: CREATE_AUTO_PAYMENT })
  async createPayment({ payload }) {
    return this.commandBus.execute(
      new CreatePaymentCommand(payload.userInfo, payload.createSubscriptionDto),
    );
  }

  @MessagePattern({ cmd: STRIPE_WEBHOOK_HANDLER })
  async stripeWebhookHandler({ payload }) {
    return this.commandBus.execute(
      new StripeWebhookCommand(payload.rawBody, payload.signatureHeader),
    );
  }

  @MessagePattern({ cmd: DISABLE_AUTO_RENEWAL })
  async disableAutoRenewal({ payload }) {
    return this.commandBus.execute(
      new DisableAutoRenewalCommand(payload.userId),
    );
  }

  @MessagePattern({ cmd: ENABLE_AUTO_RENEWAL })
  async enableAutoRenewal({ payload }) {
    return this.commandBus.execute(
      new EnableAutoRenewalCommand(payload.userId),
    );
  }

  @MessagePattern({ cmd: GET_PAYMENTS })
  async getPayments({ payload }) {
    return this.queryBus.execute(new GetPaymentsQuery(payload.userId));
  }

  async sendSubscriptionInfo(payload: any) {
    try {
      const responseOfService = this.paymentsServiceClient
        .send({ cmd: SEND_SUBSCRIPTION_INFO }, { payload })
        .pipe(timeout(10000));

      const result = await firstValueFrom(responseOfService);
      return result;
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }
}
