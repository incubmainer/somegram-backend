import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './common/config/configs/app.config';
import { appSetting } from './app-setting';
import { applySettings } from './settings/apply-settings';
import { ConfigurationType } from './settings/configuration/configuration';
import { LoggerService } from '@app/logger';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  //const configService = app.get(ConfigService);
  //const appConfig = configService.get<AppConfig>('app');
  //appSetting(app);
  applySettings(app);

  const logger: LoggerService = await app.resolve(LoggerService);
  const configService = app.get(ConfigService<ConfigurationType, true>);
  const envSettings = configService.get('envSettings', { infer: true });
  await app.listen(envSettings.PORT);
  logger.setContext('Gateway');
  logger.log(`Gateway started on port ${envSettings.PORT}`, bootstrap.name);
}
bootstrap();
