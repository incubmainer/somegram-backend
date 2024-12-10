import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { ConfigService } from '@nestjs/config';
import { applySettings } from './settings/apply-settings';
import { ConfigurationType } from './settings/configuration/configuration';
import { LoggerService } from '@app/logger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule, {
    rawBody: true,
  });
  applySettings(app);
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

  const logger: LoggerService = await app.resolve(LoggerService);
  const configService = app.get(ConfigService<ConfigurationType, true>);
  const envSettings = configService.get('envSettings', { infer: true });
  await app.listen(envSettings.PORT);
  logger.setContext('Gateway');
  logger.log(`Gateway started on port ${envSettings.PORT}`, bootstrap.name);
}
bootstrap();
