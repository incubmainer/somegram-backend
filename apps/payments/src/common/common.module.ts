import { Global, Module } from '@nestjs/common';
import { PayPalSignatureGuard } from './guards/paypal/paypal.guard';
import { PayPalAdapter } from './adapters/paypal.adapter';
import {
  PAYMENTS_SERVICE_RMQ,
  PAYPAL_CLIENT,
} from './constants/adapters-name.constant';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../settings/configuration/configuration';
import { Client, Environment, LogLevel } from '@paypal/paypal-server-sdk';
import { CqrsModule } from '@nestjs/cqrs';
import { ApplicationNotificationModule } from '@app/application-notification';
import { PaymentManager } from './managers/payment.manager';
import { StripeAdapter } from './adapters/stripe.adapter';
import { ClsTransactionalModule } from './modules/cls-transactional.module';
import { GatewayServiceClientAdapter } from './adapters/gateway-service-client.adapter';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { configModule } from '../settings/configuration/config.module';
import { LoggerModule } from '@app/logger';
import { EnvSettings } from '../settings/env/env.settings';

const paypalClient = {
  provide: PAYPAL_CLIENT,
  useFactory: (configService: ConfigService<ConfigurationType, true>) => {
    const envSettings = configService.get('envSettings', { infer: true });
    const clientId = envSettings.PAYPAL_CLIENT_ID;
    const clientSecret = envSettings.PAYPAL_CLIENT_SECRET;

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

// const paypalOrdersController = {
//   provide: PAYPAL_ORDERS_CONTROLLER,
//   useFactory: (client: Client) => {
//     return new OrdersController(client);
//   },
//   inject: [PAYPAL_CLIENT],
// };
//
// const paypalPaymentsController = {
//   provide: PAYPAL_PAYMENTS_CONTROLLER,
//   useFactory: (client: Client) => {
//     return new PayPalPaymentsController(client);
//   },
//   inject: [PAYPAL_CLIENT],
// };

@Global()
@Module({
  imports: [
    CqrsModule,
    ApplicationNotificationModule,
    ClsTransactionalModule,
    ClientsModule.registerAsync([
      {
        name: PAYMENTS_SERVICE_RMQ,
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RMQ_CONNECTION_STRING')],
            queue: 'payments_queue',
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    configModule,
    LoggerModule.forRoot('Payments'),
    CommonModule,
  ],
  controllers: [],
  providers: [
    PayPalSignatureGuard,
    PayPalAdapter,
    paypalClient,
    PaymentManager,
    StripeAdapter,
    GatewayServiceClientAdapter,
  ],
  exports: [
    PayPalSignatureGuard,
    PayPalAdapter,
    CqrsModule,
    PaymentManager,
    GatewayServiceClientAdapter,
  ],
})
export class CommonModule {}
