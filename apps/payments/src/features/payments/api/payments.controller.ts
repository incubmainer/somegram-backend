import { Controller, InternalServerErrorException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern } from '@nestjs/microservices';
import {
  CREATE_AUTO_PAYMENT,
  STRIPE_WEBHOOK_HANDLER,
  DISABLE_AUTO_RENEWAL,
  ENABLE_AUTO_RENEWAL,
  GET_PAYMENTS,
  GET_SUBSCRIPTION_INFO,
  PAYPAL_WEBHOOK_HANDLER,
} from '../../../../../gateway/src/common/constants/service.constants';
import { GetSubscriptionInfoQuery } from '../application/use-cases/query/get-subscription-info.use-case';
import { PayPalSignatureGuard } from '../../../common/guards/paypal/paypal.guard';
import { PaypalEventAdapter } from '../../../common/adapters/paypal-event.adapter';
import { PaymentSystem } from '../../../../../../libs/common/enums/payments';
import { CreatePaymentCommand } from '../application/use-cases/command/create-payment.use-case';
import { StripeWebhookCommand } from '../application/use-cases/command/stripe-webhook.use-case';
import { EnableAutoRenewalCommand } from '../application/use-cases/command/enable-autorenewal.use-case';
import { GetPaymentsQuery } from '../application/use-cases/query/get-payments.use-case';
import { DisableAutoRenewalCommand } from '../application/use-cases/command/disable-autorenewal.use-case';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly eventManager: PaypalEventAdapter,
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

  @MessagePattern({ cmd: PAYPAL_WEBHOOK_HANDLER })
  //@UseGuards(PayPalSignatureGuard)
  async paypalWebhookHandler({ payload }): Promise<any> {
    return await this.eventManager.handleEvent(payload.rawBody);
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

  @MessagePattern({ cmd: GET_SUBSCRIPTION_INFO })
  async getSubscriptionInfo({ payload }) {
    return this.queryBus.execute(new GetSubscriptionInfoQuery(payload.userId));
  }
}
