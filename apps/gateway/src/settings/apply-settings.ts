import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import * as cookieParser from 'cookie-parser';
import { GatewayModule } from '../gateway.module';
import {
  ConfigurationType,
  corsWhiteList,
} from './configuration/configuration';
import { EnvSettings } from './env/env.settings';
import { ValidationPipeOption } from '../common/pipe/validation/validation-options.pipe';
import { HttpExceptionFilter } from '../common/exception-filter/http/http.exception-filter';

export const applySettings = (app: INestApplication): void => {
  /*
    It configures the application to use the dependency container from the module and enables error handling with a fallback mode.
    If an error occurs while resolving a dependency, the application will not terminate but will continue execution,
    applying the fallback logic.
   */
  useContainer(app.select(GatewayModule), { fallbackOnErrors: true });

  enableCors(app);

  enableCookieParser(app);

  const globalPrefix: string = enableGlobalPrefix(app);

  setPipes(app);
  //
  setExceptionFilter(app);

  enableSwagger(app, globalPrefix);
};

const enableCors = (app: INestApplication): void => {
  app.enableCors({
    origin: corsWhiteList,
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Origin',
      'X-Requested-With',
      'Accept',
      'Authorization',
    ],
    exposedHeaders: ['Authorization'],
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
  });
};

const enableSwagger = (app: INestApplication, globalPrefix: string): void => {
  const config: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
    .setTitle('api')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .setDescription('api swagger')
    .setVersion('1.0')
    .build();
  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);

  const swaggerPath: string = globalPrefix
    ? `${globalPrefix}/swagger`
    : 'swagger';

  SwaggerModule.setup(swaggerPath, app, document);
};

const enableGlobalPrefix = (app: INestApplication): string => {
  const configService: ConfigService = app.get(
    ConfigService<ConfigurationType, true>,
  );
  const envSettings: EnvSettings = configService.get('envSettings', {
    infer: true,
  });

  const prefix: string = envSettings.GLOBAL_PREFIX;

  app.setGlobalPrefix(prefix);

  return prefix;
};

const enableCookieParser = (app: INestApplication): void => {
  app.use(cookieParser());
};

const setPipes = (app: INestApplication) => {
  const validationPipeOptions: ValidationPipeOption =
    new ValidationPipeOption();
  const validationPipe: ValidationPipe = new ValidationPipe(
    validationPipeOptions,
  );
  app.useGlobalPipes(validationPipe);
};

const setExceptionFilter = (app: INestApplication) => {
  app.useGlobalFilters(new HttpExceptionFilter());
};
