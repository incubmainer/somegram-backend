import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { PaymentsModule } from './payments.module';

async function bootstrap() {
  const configService = new ConfigService();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    PaymentsModule,
    {
      transport: Transport.TCP,
      options: {
        host: configService.get<string>('PAYMENTS_SERVICE_HOST') || '0.0.0.0',
        port:
          Number(configService.get<string>('PAYMENTS_SERVICE_PORT')) || 3006,
      },
    },
  );

  await app.listen();
}
bootstrap();
