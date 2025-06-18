import { NestFactory } from '@nestjs/core';
import { MessengerModule } from './messenger.module';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from './settings/configuration/configuration';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { applySettings } from './settings/apply-settings';
import { LoggerService } from '@app/logger';

async function bootstrap() {
  const app = await NestFactory.create(MessengerModule);
  const appConfigService = app.get(ConfigService<ConfigurationType, true>);
  const appEnvSettings = appConfigService.get('envSettings', {
    infer: true,
  });
  const port = appEnvSettings.MESSENGER_SERVICE_PORT;
  const host = appEnvSettings.MESSENGER_SERVICE_HOST;
  await app.close();

  const microserviceApp =
    await NestFactory.createMicroservice<MicroserviceOptions>(MessengerModule, {
      transport: Transport.TCP,
      options: {
        host: host,
        port: port,
      },
    });

  applySettings(microserviceApp);
  const configService = microserviceApp.get(
    ConfigService<ConfigurationType, true>,
  );
  const envSettings = configService.get('envSettings', { infer: true });

  const logger: LoggerService = await microserviceApp.resolve(LoggerService);

  await microserviceApp.listen();
  logger.setContext('Messenger');
  logger.log(
    `Messenger started on port ${envSettings.MESSENGER_SERVICE_PORT}`,
    bootstrap.name,
  );
}
bootstrap();
