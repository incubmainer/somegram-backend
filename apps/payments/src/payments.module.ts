import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { loadEnvFileNames } from './common/config/load-env-file-names';
import { paymentsConfig } from './common/config/config';
import { PaymentsController } from './features/payments/api/payments.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { ClsTransactionalModule } from './common/modules/cls-transactional.module';
import { CreatePaymentUseCase } from './features/payments/application/use-cases/create-payment.use-case';
import { PaymentManager } from './common/managers/payment.manager';
import { PaymentsRepository } from './features/payments/infrastructure/payments.repository';
import { StripeAdapter } from './common/adapters/stripe.adapter';
import { StripeWebhookUseCase } from './features/payments/application/use-cases/stripe-webhook.use-case';
import { DisableAutoRenewalUseCase } from './features/payments/application/use-cases/disable-autorenewal.use-case';
import { EnableAutoRenewalUseCase } from './features/payments/application/use-cases/enable-autorenewal.use-case';
import { PaymentsService } from './features/payments/api/payments.service';
import { GetPaymentsQueryUseCase } from './features/payments/application/use-cases/get-payments.use-case';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GatewayServiceClientAdapter } from './common/adapters/gateway-service-client.adapter';
import { PayPalAdapter } from './common/adapters/paypal.adapter';
import {
  Client,
  Environment,
  LogLevel,
  OrdersController,
  PaymentsController as PayPalPaymentsController,
} from '@paypal/paypal-server-sdk';
import {
  PAYPAL_CLIENT,
  PAYPAL_ORDERS_CONTROLLER,
  PAYPAL_PAYMENTS_CONTROLLER,
} from './common/constants/adapters-name.constant';
import { ApplicationNotificationModule } from '@app/application-notification';
import { PayPalSignatureGuard } from './common/guards/paypal/paypal.guard';
import { EventManager } from './common/managers/event.manager';

const useCases = [
  CreatePaymentUseCase,
  StripeWebhookUseCase,
  DisableAutoRenewalUseCase,
  EnableAutoRenewalUseCase,
  GetPaymentsQueryUseCase,
];

const repositories = [PaymentsRepository];

const paypalClient = {
  provide: PAYPAL_CLIENT,
  useFactory: (configService: ConfigService) => {
    const clientId = configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = configService.get<string>('PAYPAL_CLIENT_SECRET');

    return new Client({
      clientCredentialsAuthCredentials: {
        oAuthClientId: clientId,
        oAuthClientSecret: clientSecret,
      },
      timeout: 0,
      environment: Environment.Sandbox,
      logging: {
        logLevel: LogLevel.Info,
        logRequest: { logBody: true },
        logResponse: { logHeaders: true },
      },
    });
  },
  inject: [ConfigService],
};

const paypalOrdersController = {
  provide: PAYPAL_ORDERS_CONTROLLER,
  useFactory: (client: Client) => {
    return new OrdersController(client);
  },
  inject: [PAYPAL_CLIENT],
};

const paypalPaymentsController = {
  provide: PAYPAL_PAYMENTS_CONTROLLER,
  useFactory: (client: Client) => {
    return new PayPalPaymentsController(client);
  },
  inject: [PAYPAL_CLIENT],
};

const services = [
  PaymentsService,
  PaymentManager,
  StripeAdapter,
  GatewayServiceClientAdapter,
  PayPalAdapter,
  paypalClient,
  paypalOrdersController,
  paypalPaymentsController,
  PayPalSignatureGuard,
  EventManager,
];

@Module({
  imports: [
    CqrsModule,
    ClsTransactionalModule,
    ClientsModule.register([
      {
        name: 'PAYMENTS_SERVICE_RMQ',
        transport: Transport.RMQ,
        options: {
          urls: [
            'amqps://xbnnkzhp:ohtRICSwQSNQnsx2HCgdIwSfgtWZcKXj@kebnekaise.lmq.cloudamqp.com/xbnnkzhp',
          ],
          queue: 'payments_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,
      envFilePath: loadEnvFileNames(),
      load: [paymentsConfig],
    }),
    ApplicationNotificationModule,
  ],
  controllers: [PaymentsController],
  providers: [...useCases, ...repositories, ...services],
})
export class PaymentsModule {}
