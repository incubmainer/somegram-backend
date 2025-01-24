import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { PaymentsModule } from './payments.module';
import { LoggerService } from '@app/logger';
import { ConfigurationType } from './settings/configuration/configuration';
import { applySettings } from './settings/apply-settings';

async function bootstrap() {
  const app = await NestFactory.create(PaymentsModule);
  const appConfigService = app.get(ConfigService<ConfigurationType, true>);
  const appEnvSettings = appConfigService.get('envSettings', {
    infer: true,
  });
  const port = appEnvSettings.PAYMENTS_SERVICE_PORT;
  const host = appEnvSettings.PAYMENTS_SERVICE_HOST;
  await app.close();

  const microserviceApp =
    await NestFactory.createMicroservice<MicroserviceOptions>(PaymentsModule, {
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
  logger.setContext('Payments');
  logger.log(
    `Payments started on port ${envSettings.PAYMENTS_SERVICE_PORT}`,
    bootstrap.name,
  );
}
bootstrap();
