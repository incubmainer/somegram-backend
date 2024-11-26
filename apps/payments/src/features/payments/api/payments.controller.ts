import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern } from '@nestjs/microservices';
import {
  CREATE_PAYMENT,
  STRIPE_WEBHOOK_HANDLER,
} from '../../../../../gateway/src/common/config/constants/service.constants';
import { CreatePaymentCommand } from '../application/use-cases/create-payment.use-case';
import { StripeWebhookCommand } from '../application/use-cases/stripe-webhook.use-case';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern({ cmd: CREATE_PAYMENT })
  async createPayment({ payload }) {
    return this.commandBus.execute(
      new CreatePaymentCommand(payload.userInfo, payload.createSubscriptionDto),
    );
  }

  @MessagePattern({ cmd: STRIPE_WEBHOOK_HANDLER })
  async stripeWebhookKandler({ payload }) {
    return this.commandBus.execute(
      new StripeWebhookCommand(payload.rawBody, payload.signatureHeader),
    );
  }
}
