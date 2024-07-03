import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  app.setGlobalPrefix('/backend-api');
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
