import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsProviderAsyncOptions, Transport } from '@nestjs/microservices';

export const messengerServiceOptions = (): ClientsProviderAsyncOptions => {
  return {
    useFactory: (configService: ConfigService) => ({
      transport: Transport.TCP,
      options: {
        host: configService.get('MESSENGER_SERVICE_HOST') || '0.0.0.0',
        port: Number(configService.get('MESSENGER_SERVICE_PORT')) || 3006,
      },
    }),
    inject: [ConfigService],
    imports: [ConfigModule],
    name: 'MESSENGER_SERVICE',
  };
};
