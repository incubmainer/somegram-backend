import { Module } from '@nestjs/common';

import { PaymentsController } from './features/payments/api/payments.controller';
import { CreatePaymentUseCase } from './features/payments/application/use-cases/command/create-payment.use-case';
import { PaymentsRepository } from './features/payments/infrastructure/payments.repository';
import { StripeWebhookUseCase } from './features/payments/application/use-cases/command/stripe-webhook.use-case';
import { DisableAutoRenewalUseCase } from './features/payments/application/use-cases/command/disable-autorenewal.use-case';
import { EnableAutoRenewalUseCase } from './features/payments/application/use-cases/command/enable-autorenewal.use-case';
import { GetPaymentsQueryUseCase } from './features/payments/application/use-cases/query/get-payments.use-case';
import { StripeEventAdapter } from './common/adapters/stripe-event.adaper';
import { GetSubscriptionInfoQueryUseCase } from './features/payments/application/use-cases/query/get-subscription-info.use-case';
import { PaypalEventAdapter } from './common/adapters/paypal-event.adapter';
import { PayPalPaymentSucceededHandler } from './features/payments/application/handlers/paypal/paypal-payment-succeeded.handler';
import { PaypalSubscriptionActiveHandler } from './features/payments/application/handlers/paypal/paypal-subscription-active.handler';
import { PayPalSubscriptionCreateUseCaseHandler } from './features/payments/application/use-cases/command/paypal-subscription-create.use-case';
import { TransactionEntity } from './features/payments/domain/transaction.entity';
import { SubscriptionEntity } from './features/payments/domain/subscription.entity';
import { PayPalPaymentFailedHandler } from './features/payments/application/handlers/paypal/paypal-payment-failed.handler';
import { PaypalSubscriptionSuspendedHandler } from './features/payments/application/handlers/paypal/paypal-subscription-suspended.handler';
import { PaypalSubscriptionCancelHandler } from './features/payments/application/handlers/paypal/paypal-subscription-cancel.handler';
import { AsyncLocalStorageService, LoggerModule } from '@app/logger';
import { configModule } from './settings/configuration/config.module';
import { CommonModule } from './common/common.module';
import { TestingCancelSubscriptionUseCaseHandler } from './features/payments/application/use-cases/command/testing-cancel-subscription';
import { TestingGetPaymentsQueryUseCase } from './features/payments/application/use-cases/query/testing-get-payments.use-case';
import { StripeSubscriptionCreateUseCase } from './features/payments/application/use-cases/command/stripe-subscription-create.use-case';
import { StripeInvoicePaymentFailedHandler } from './features/payments/application/handlers/stripe/stripe-invoice-payment-failed.handler';
import { StripeInvoicePaymentSucceededHandler } from './features/payments/application/handlers/stripe/stripe-invoice-payment-succeeded.handler';
import { StripeSubscriptionDeletedHandler } from './features/payments/application/handlers/stripe/stripe-subscription-deleted.handler';
import { StripeCheckouSessionCompletedHandler } from './features/payments/application/handlers/stripe/stripe-checkout-session-completed.handler';
import { PaymentService } from './features/payments/application/payments.service';

const useCases = [
  CreatePaymentUseCase,
  StripeWebhookUseCase,
  DisableAutoRenewalUseCase,
  EnableAutoRenewalUseCase,
  GetPaymentsQueryUseCase,
  GetSubscriptionInfoQueryUseCase,
  PayPalSubscriptionCreateUseCaseHandler,
  TestingGetPaymentsQueryUseCase,
  TestingCancelSubscriptionUseCaseHandler,
  StripeSubscriptionCreateUseCase,
];

const repositories = [PaymentsRepository];

const transactionEntityProvider = {
  provide: 'TransactionEntity',
  useValue: TransactionEntity,
};

const subscriptionEntityProvider = {
  provide: 'SubscriptionEntity',
  useValue: SubscriptionEntity,
};

const services = [
  StripeEventAdapter,
  //GatewayServiceClientAdapter,
  PaypalEventAdapter,
  transactionEntityProvider,
  subscriptionEntityProvider,
  PaymentService,
];

const payPalHandlers = [
  PayPalPaymentSucceededHandler,
  PaypalSubscriptionActiveHandler,
  PayPalPaymentFailedHandler,
  PaypalSubscriptionSuspendedHandler,
  PaypalSubscriptionCancelHandler,
];

const stripeHandlers = [
  StripeInvoicePaymentFailedHandler,
  StripeInvoicePaymentSucceededHandler,
  StripeSubscriptionDeletedHandler,
  StripeCheckouSessionCompletedHandler,
];

@Module({
  imports: [configModule, LoggerModule.forRoot('Payments'), CommonModule],
  controllers: [PaymentsController],
  providers: [
    ...useCases,
    ...repositories,
    ...services,
    ...payPalHandlers,
    ...stripeHandlers,
    AsyncLocalStorageService,
  ],
})
export class PaymentsModule {}
