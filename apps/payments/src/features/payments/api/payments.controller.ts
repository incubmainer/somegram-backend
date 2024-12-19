import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern } from '@nestjs/microservices';

import { CreatePaymentCommand } from '../application/use-cases/command/create-payment.use-case';
import { StripeWebhookCommand } from '../application/use-cases/command/stripe-webhook.use-case';
import { DisableAutoRenewalCommand } from '../application/use-cases/command/disable-autorenewal.use-case';
import { EnableAutoRenewalCommand } from '../application/use-cases/command/enable-autorenewal.use-case';
import { GetPaymentsQuery } from '../application/use-cases/query/get-payments.use-case';
import {
  CREATE_AUTO_PAYMENT,
  STRIPE_WEBHOOK_HANDLER,
  DISABLE_AUTO_RENEWAL,
  ENABLE_AUTO_RENEWAL,
  GET_PAYMENTS,
  GET_SUBSCRIPTION_INFO,
} from '../../../../../gateway/src/common/constants/service.constants';
import { GetSubscriptionInfoQuery } from '../application/use-cases/query/get-subscription-info.use-case';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
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
    return await this.commandBus.execute(
      new EnableAutoRenewalCommand(payload.userId),
    );
  }

  @MessagePattern({ cmd: GET_PAYMENTS })
  async getPayments({ payload }) {
    return this.queryBus.execute(new GetPaymentsQuery(payload.userId));
  }

  @MessagePattern({ cmd: GET_SUBSCRIPTION_INFO })
  async getSubscriptionInfo({ payload }) {
    return this.queryBus.execute(new GetSubscriptionInfoQuery(payload.userId));
  }
}
