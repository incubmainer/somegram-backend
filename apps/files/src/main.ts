import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { FilesModule } from './files.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const configService = new ConfigService();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    FilesModule,
    {
      transport: Transport.TCP,
      options: {
        host: configService.get<string>('PHOTO_SERVICE_HOST') || '0.0.0.0',
        port: Number(configService.get<string>('PHOTO_SERVICE_PORT')) || 3005,
      },
    },
  );

  await app.listen();
}
bootstrap();
