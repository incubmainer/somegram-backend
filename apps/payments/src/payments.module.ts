import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaymentsController } from './features/payments/api/payments.controller';
import { ClsTransactionalModule } from './common/modules/cls-transactional.module';
import { CreatePaymentUseCase } from './features/payments/application/use-cases/command/create-payment.use-case';
import { PaymentsRepository } from './features/payments/infrastructure/payments.repository';
import { StripeWebhookUseCase } from './features/payments/application/use-cases/command/stripe-webhook.use-case';
import { DisableAutoRenewalUseCase } from './features/payments/application/use-cases/command/disable-autorenewal.use-case';
import { EnableAutoRenewalUseCase } from './features/payments/application/use-cases/command/enable-autorenewal.use-case';
import { PaymentsService } from './features/payments/api/payments.service';
import { GetPaymentsQueryUseCase } from './features/payments/application/use-cases/query/get-payments.use-case';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GatewayServiceClientAdapter } from './common/adapters/gateway-service-client.adapter';
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

const useCases = [
  CreatePaymentUseCase,
  StripeWebhookUseCase,
  DisableAutoRenewalUseCase,
  EnableAutoRenewalUseCase,
  GetPaymentsQueryUseCase,
  GetSubscriptionInfoQueryUseCase,
  PayPalSubscriptionCreateUseCaseHandler,
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
  PaymentsService,
  StripeEventAdapter,
  //GatewayServiceClientAdapter,
  PaypalEventAdapter,
  transactionEntityProvider,
  subscriptionEntityProvider,
];

const payPalHandlers = [
  PayPalPaymentSucceededHandler,
  PaypalSubscriptionActiveHandler,
  PayPalPaymentFailedHandler,
  PaypalSubscriptionSuspendedHandler,
  PaypalSubscriptionCancelHandler,
];

@Module({
  imports: [
    //ClsTransactionalModule,
    //   ClientsModule.registerAsync([
    //     {
    //       name: 'PAYMENTS_SERVICE_RMQ',
    //       imports: [ConfigModule],
    //       useFactory: async (configService: ConfigService) => ({
    //         transport: Transport.RMQ,
    //         options: {
    //           urls: [configService.get<string>('RMQ_CONNECTION_STRING')],
    //           queue: 'payments_queue',
    //           queueOptions: {
    //             durable: false,
    //           },
    //         },
    //       }),
    //       inject: [ConfigService],
    //     },
    //   ]),
    configModule,
    LoggerModule.forRoot('Payments'),
    CommonModule,
  ],
  controllers: [PaymentsController],
  providers: [
    ...useCases,
    ...repositories,
    ...services,
    ...payPalHandlers,
    AsyncLocalStorageService,
  ],
})
export class PaymentsModule {}
