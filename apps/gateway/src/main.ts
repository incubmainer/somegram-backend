import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { NotFoundExceptionFilter } from './tmp.exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  app.setGlobalPrefix('/backend-api');
  app.useGlobalFilters(new NotFoundExceptionFilter());
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
