import {
  INestApplication,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './common/config/configs/app.config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationError } from 'class-validator';

export const appSetting = (app: INestApplication) => {
  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app');
  app.setGlobalPrefix(appConfig.GLOBAL_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: false,
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = errors.map((error) => {
          return {
            property: error.property,
            constraints: error.constraints,
          };
        });
        return new UnprocessableEntityException({
          statusCode: 422,
          message: 'Validation failed',
          errors: formattedErrors,
        });
      },
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('api')
    .setDescription('api swagger')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
};
