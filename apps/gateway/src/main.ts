import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './common/config/configs/app.config';
import { appSetting } from './app-setting';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule, {
    rawBody: true,
  });
  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app');
  appSetting(app);
  const app2 = await NestFactory.createMicroservice<MicroserviceOptions>(
    GatewayModule,
    {
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
  );
  await app2.listen();
  await app.listen(appConfig.PORT);
}
bootstrap();
