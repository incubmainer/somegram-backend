import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsProviderAsyncOptions, Transport } from '@nestjs/microservices';

export const photoServiceOptions = (): ClientsProviderAsyncOptions => {
  return {
    useFactory: (configService: ConfigService) => ({
      transport: Transport.TCP,
      options: {
        host: configService.get('PHOTO_SERVICE_HOST') || '0.0.0.0',
        port: Number(configService.get('PHOTO_SERVICE_PORT')) || 3005,
      },
    }),
    inject: [ConfigService],
    imports: [ConfigModule],
    name: 'PHOTO_SERVICE',
  };
};
