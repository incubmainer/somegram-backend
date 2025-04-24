import { Global, Module } from '@nestjs/common';
import { clsModule } from './modules/cls/cls.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { CqrsModule } from '@nestjs/cqrs';
import { ApplicationNotification } from '@app/application-notification';
import { PaginatorModule } from '@app/paginator';
import { GatewayAdapter } from './adapters/gateway.adapter';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GATEWAY_CLIENT_RMQ } from './constants/adapters-name.constant';
import { ConfigurationType } from '../settings/configuration/configuration';

const exportProviders = [
  PrismaModule,
  CqrsModule,
  PaginatorModule,
  GatewayAdapter,
  ApplicationNotification,
  ClientsModule,
];

@Global()
@Module({
  imports: [
    clsModule,
    PrismaModule,
    CqrsModule,
    PaginatorModule,
    ClientsModule.registerAsync([
      {
        name: GATEWAY_CLIENT_RMQ,
        imports: [ConfigModule],
        useFactory: async (
          configService: ConfigService<ConfigurationType, true>,
        ) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              configService.get('envSettings', { infer: true })
                .RMQ_CONNECTION_STRING,
            ],
            queue: 'messenger_queue',
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [],
  providers: [ApplicationNotification, GatewayAdapter],
  exports: [...exportProviders],
})
export class CommonModule {}
