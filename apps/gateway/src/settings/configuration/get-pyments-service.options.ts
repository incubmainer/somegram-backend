import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsProviderAsyncOptions, Transport } from '@nestjs/microservices';

export const paymentsServiceOptions = (): ClientsProviderAsyncOptions => {
  return {
    useFactory: (configService: ConfigService) => ({
      transport: Transport.TCP,
      options: {
        host: configService.get('PAYMENTS_SERVICE_HOST') || '0.0.0.0',
        port: Number(configService.get('PAYMENTS_SERVICE_PORT')) || 3006,
      },
    }),
    inject: [ConfigService],
    imports: [ConfigModule],
    name: 'PAYMENTS_SERVICE',
  };
};
