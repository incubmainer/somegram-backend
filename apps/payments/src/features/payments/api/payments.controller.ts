import { Controller, UseGuards } from '@nestjs/common';
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
import { PaypalEventAdapter } from '../../../common/adapters/paypal-event.adapter';
import { CreatePaymentCommand } from '../application/use-cases/command/create-payment.use-case';
import { StripeWebhookCommand } from '../application/use-cases/command/stripe-webhook.use-case';
import { EnableAutoRenewalCommand } from '../application/use-cases/command/enable-autorenewal.use-case';
import { GetPaymentsQuery } from '../application/use-cases/query/get-payments.use-case';
import { DisableAutoRenewalCommand } from '../application/use-cases/command/disable-autorenewal.use-case';
import { AppNotificationResultType } from '@app/application-notification';
import {
  CreatePaymentInputDto,
  PayPalRawBodyPayloadType,
} from './dto/input-dto/create-payment.dto';
import { LoggerService } from '@app/logger';
import { PayPalSignatureGuard } from '../../../common/guards/paypal/paypal.guard';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly eventManager: PaypalEventAdapter,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PaymentsController.name);
  }

  @MessagePattern({ cmd: CREATE_AUTO_PAYMENT })
  async createPayment(
    payload: CreatePaymentInputDto,
  ): Promise<AppNotificationResultType<string>> {
    this.logger.debug('Execute: create auto payment', this.createPayment.name);
    return this.commandBus.execute(
      new CreatePaymentCommand(payload.userInfo, payload.createSubscriptionDto),
    );
  }

  @MessagePattern({ cmd: STRIPE_WEBHOOK_HANDLER })
  async stripeWebhookHandler({ payload }) {
    this.logger.debug(
      'Execute: stripe webhook',
      this.stripeWebhookHandler.name,
    );
    return this.commandBus.execute(
      new StripeWebhookCommand(payload.rawBody, payload.signatureHeader),
    );
  }

  @MessagePattern({ cmd: PAYPAL_WEBHOOK_HANDLER })
  @UseGuards(PayPalSignatureGuard)
  async paypalWebhookHandler(
    payload: PayPalRawBodyPayloadType,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug(
      'Execute: paypal webhook',
      this.paypalWebhookHandler.name,
    );
    return await this.eventManager.handleEvent(payload.rawBody);
  }

  @MessagePattern({ cmd: DISABLE_AUTO_RENEWAL })
  async disableAutoRenewal({
    payload,
  }): Promise<AppNotificationResultType<null>> {
    this.logger.debug(
      'Execute: disable auto renewal',
      this.disableAutoRenewal.name,
    );
    return this.commandBus.execute(
      new DisableAutoRenewalCommand(payload.userId),
    );
  }

  @MessagePattern({ cmd: ENABLE_AUTO_RENEWAL })
  async enableAutoRenewal({ payload }) {
    this.logger.debug(
      'Execute: enable auto renewal',
      this.enableAutoRenewal.name,
    );
    return this.commandBus.execute(
      new EnableAutoRenewalCommand(payload.userId),
    );
  }

  @MessagePattern({ cmd: GET_PAYMENTS })
  async getPayments({ payload }) {
    this.logger.debug('Execute: get payments', this.getPayments.name);
    return this.queryBus.execute(
      new GetPaymentsQuery(payload.userId, payload.queryString),
    );
  }

  @MessagePattern({ cmd: GET_SUBSCRIPTION_INFO })
  async getSubscriptionInfo({ payload }) {
    this.logger.debug(
      'Execute: get subscription info',
      this.getSubscriptionInfo.name,
    );
    return this.queryBus.execute(new GetSubscriptionInfoQuery(payload.userId));
  }
}
