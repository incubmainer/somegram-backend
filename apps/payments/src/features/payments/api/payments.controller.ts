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
  TESTING_CANCEL_SUBSCRIPTION,
  TESTING_GET_PAYMENTS,
  TESTING_GET_NOTIFICATION,
  GET_ALL_PAYMENTS_GQL,
  GET_PAYMENTS_BY_USERS_GQL,
  GET_PAYMENTS_GQL,
} from '../../../../../gateway/src/common/constants/service.constants';
import { GetSubscriptionInfoQuery } from '../application/use-cases/query/get-subscription-info.use-case';
import { PaypalEventAdapter } from '../../../common/adapters/paypal-event.adapter';
import { CreatePaymentCommand } from '../application/use-cases/command/create-payment.use-case';
import { StripeWebhookCommand } from '../application/use-cases/command/stripe-webhook.use-case';
import { EnableAutoRenewalCommand } from '../application/use-cases/command/enable-autorenewal.use-case';
import { GetPaymentsQuery } from '../application/use-cases/query/get-payments.use-case';
import { DisableAutoRenewalCommand } from '../application/use-cases/command/disable-autorenewal.use-case';
import { AppNotificationResultType } from '@app/application-notification';
import { CreatePaymentInputDto } from './dto/input-dto/create-payment.dto';
import { LoggerService } from '@app/logger';
import { PayPalSignatureGuard } from '../../../common/guards/paypal/paypal.guard';
import {
  GetUserPaymentPayloadType,
  PayPalRawBodyPayloadType,
  StripeRawBodyPayloadType,
} from '../../../../../gateway/src/features/subscriptions/domain/types';
import { TestingCancelSubscriptionUseCase } from '../application/use-cases/command/testing-cancel-subscription';
import { TestingGetPaymentsQuery } from '../application/use-cases/query/testing-get-payments.use-case';
import {
  MyPaymentsOutputDto,
  PaymentsWithUserInfoOutputDto,
  SubscriptionInfoOutputDto,
} from './dto/output-dto/payments.output-dto';
import { PaymentService } from '../application/payments.service';
import { Pagination } from '@app/paginator';
import { Subscription } from 'rxjs';
import { SearchQueryParameters } from '../../../../../gateway/src/common/domain/query.types';
import { GetAllPaymentsQuery } from '../application/use-cases/query/graphql/get-all-payments.use-case';
import { GetPaymentsByUsersQuery } from '../application/use-cases/query/graphql/get-payments-by-users.use-case';
import { GetPaymentsByUserQuery } from '../application/use-cases/query/graphql/get-payments.use-case';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly eventManager: PaypalEventAdapter,
    private readonly logger: LoggerService,
    private readonly paymentService: PaymentService,
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
  async stripeWebhookHandler(
    payload: StripeRawBodyPayloadType,
  ): Promise<AppNotificationResultType<null>> {
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
  async disableAutoRenewal(
    payload: string,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug(
      'Execute: disable auto renewal',
      this.disableAutoRenewal.name,
    );
    return this.commandBus.execute(new DisableAutoRenewalCommand(payload));
  }

  @MessagePattern({ cmd: ENABLE_AUTO_RENEWAL })
  async enableAutoRenewal(
    payload: string,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug(
      'Execute: enable auto renewal',
      this.enableAutoRenewal.name,
    );
    return this.commandBus.execute(new EnableAutoRenewalCommand(payload));
  }

  @MessagePattern({ cmd: GET_PAYMENTS })
  async getPayments(
    payload: GetUserPaymentPayloadType,
  ): Promise<AppNotificationResultType<Pagination<MyPaymentsOutputDto[]>>> {
    this.logger.debug('Execute: get payments', this.getPayments.name);
    return this.queryBus.execute(
      new GetPaymentsQuery(payload.userId, payload.queryString),
    );
  }

  @MessagePattern({ cmd: GET_SUBSCRIPTION_INFO })
  async getSubscriptionInfo(
    payload: string,
  ): Promise<AppNotificationResultType<SubscriptionInfoOutputDto>> {
    this.logger.debug(
      'Execute: get subscription info',
      this.getSubscriptionInfo.name,
    );
    return this.queryBus.execute(new GetSubscriptionInfoQuery(payload));
  }

  @MessagePattern({ cmd: TESTING_CANCEL_SUBSCRIPTION })
  async testingCancelSubscription(
    payload: string,
  ): Promise<AppNotificationResultType<null>> {
    return await this.commandBus.execute(
      new TestingCancelSubscriptionUseCase(payload),
    );
  }

  @MessagePattern({ cmd: TESTING_GET_PAYMENTS })
  async testingGetPayments(
    payload: any,
  ): Promise<AppNotificationResultType<Pagination<MyPaymentsOutputDto[]>>> {
    return await this.queryBus.execute(
      new TestingGetPaymentsQuery(payload.userId, payload.queryString),
    );
  }

  @MessagePattern({ cmd: TESTING_GET_NOTIFICATION })
  async testingGetNotification(
    payload: any,
  ): Promise<AppNotificationResultType<null>> {
    return await this.paymentService.testSendNotification(payload.userId);
  }

  @MessagePattern({ cmd: GET_PAYMENTS_BY_USERS_GQL })
  async getSubscriptionsByUserIds(payload: {
    userIds: string[];
  }): Promise<AppNotificationResultType<Subscription[]>> {
    this.logger.debug(
      'Execute: get payments by users',
      this.getSubscriptionsByUserIds.name,
    );
    return this.queryBus.execute(new GetPaymentsByUsersQuery(payload.userIds));
  }

  @MessagePattern({ cmd: GET_PAYMENTS_GQL })
  async getPaymentsByUser(
    payload: GetUserPaymentPayloadType,
  ): Promise<
    AppNotificationResultType<Pagination<PaymentsWithUserInfoOutputDto[]>>
  > {
    this.logger.debug(
      'Execute: get payments by users',
      this.getPaymentsByUser.name,
    );

    return this.queryBus.execute(
      new GetPaymentsByUserQuery(payload.userId, payload.queryString),
    );
  }

  @MessagePattern({ cmd: GET_ALL_PAYMENTS_GQL })
  async getAllPayments(payload: {
    queryString?: SearchQueryParameters;
  }): Promise<
    AppNotificationResultType<Pagination<PaymentsWithUserInfoOutputDto[]>>
  > {
    this.logger.debug('Execute: get all payments', this.getPaymentsByUser.name);

    return this.queryBus.execute(new GetAllPaymentsQuery(payload.queryString));
  }
}
