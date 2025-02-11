import { Global, Module } from '@nestjs/common';
import { PayPalSignatureGuard } from './guards/paypal/paypal.guard';
import { PayPalAdapter } from './adapters/paypal.adapter';
import {
  NOTIFICATION_DELAY_SERVICE_RMQ,
  NOTIFICATION_SERVICE_RMQ,
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
import { ScheduleModule } from '@nestjs/schedule';
import { ConvertDateUtil } from './utils/convert-date.util';

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
      {
        name: NOTIFICATION_SERVICE_RMQ,
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RMQ_CONNECTION_STRING')],
            queue: 'notifications_queue',
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
      {
        name: NOTIFICATION_DELAY_SERVICE_RMQ,
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RMQ_CONNECTION_STRING')],
            queue: 'notifications_delayed_queue',
            queueOptions: {
              durable: false,
              arguments: {
                'x-message-ttl': 30000,
                'x-dead-letter-exchange': '',
                'x-dead-letter-routing-key': 'notifications_queue',
              },
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    configModule,
    LoggerModule.forRoot('Payments'),
    CommonModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [],
  providers: [
    PayPalSignatureGuard,
    PayPalAdapter,
    paypalClient,
    PaymentManager,
    StripeAdapter,
    GatewayServiceClientAdapter,
    ConvertDateUtil,
  ],
  exports: [
    PayPalSignatureGuard,
    PayPalAdapter,
    CqrsModule,
    PaymentManager,
    GatewayServiceClientAdapter,
    ConvertDateUtil,
  ],
})
export class CommonModule {}
