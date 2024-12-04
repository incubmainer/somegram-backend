import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern } from '@nestjs/microservices';
import {
  DISABLE_AUTO_RENEWAL,
  CREATE_AUTO_PAYMENT,
  STRIPE_WEBHOOK_HANDLER,
  ENABLE_AUTO_RENEWAL,
} from '../../../../../gateway/src/common/config/constants/service.constants';
import { CreatePaymentCommand } from '../application/use-cases/create-payment.use-case';
import { StripeWebhookCommand } from '../application/use-cases/stripe-webhook.use-case';
import { DisableAutoRenewalCommand } from '../application/use-cases/disable-autorenewal.use-case';
import { EnableAutoRenewalCommand } from '../application/use-cases/enable-autorenewal.use-case';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly commandBus: CommandBus) {}

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
}
