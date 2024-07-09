import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './common/config/configs/app.config';
import { appSetting } from './app-setting';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app');
  appSetting(app);
  await app.listen(appConfig.PORT);
}
bootstrap();
