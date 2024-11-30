import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { loadEnvFileNames } from './common/config/load-env-file-names';
import { finalConfig } from './common/config/config';
import { AuthModule } from './features/auth/auth.module';
import { ClsTransactionalModule } from './common/modules/cls-transactional.module';
import { UsersModule } from './features/users/users.module';
import { PostsModule } from './features/posts/posts.module';
import { AlsModule, AlsService } from '@app/als';
import {
  CustomLoggerModule,
  CustomLoggerModuleOptions,
} from '@app/custom-logger';
import {
  InjectRequestsService,
  RequestsModule,
  RequestsModuleOptions,
  RequestsService,
} from '@app/requests';
import { v4 as uuidv4 } from 'uuid';
import { LoggerConfig } from './common/config/configs/logger.config';
import { ClientsModule } from '@nestjs/microservices';
import { photoServiceOptions } from './common/config/module-options/get-photo-service.options';
import { CountryCatalogModule } from './features/country-catalog/country-catalog.module';
import { ApplicationNotificationModule } from '@app/application-notification';

export const requestId = 'reduestId';

@Module({
  imports: [
    ClientsModule.registerAsync([photoServiceOptions()]),
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,
      envFilePath: loadEnvFileNames(),
      load: [finalConfig],
    }),
    ClsTransactionalModule,
    AuthModule,
    UsersModule,
    PostsModule,
    AlsModule.forRoot({ isGlobal: true }),
    RequestsModule.forRootAsync({
      useFactory: (als: AlsService) => {
        const config: RequestsModuleOptions = {
          fields: [
            {
              fieldName: 'x-request-id',
              generator: uuidv4,
              returnInResponse: () => true,
            },
          ],
          cb: (values, next) => {
            als.start(() => {
              als.setToStore(requestId, values['x-request-id']);
              next();
            });
          },
        };
        return config;
      },
      inject: [AlsService],
    }),
    CustomLoggerModule.forRootAsync({
      useFactory: (als: AlsService, configService: ConfigService) => {
        const loggerConfig = configService.get<LoggerConfig>('logger');
        const config: CustomLoggerModuleOptions = {
          http: {
            enable: false,
            host: '',
            url: '',
            ssl: false,
          },
          console: {
            enable: true,
          },
          loggerLevel: loggerConfig.loggerLevel,
          additionalFields: {
            microserviceName: () => 'gateway',
            requestId: () => als.getFromStore(requestId),
          },
        };
        return config;
      },
      inject: [AlsService, ConfigService],
    }),
    ApplicationNotificationModule,
    CountryCatalogModule,
  ],
  controllers: [],
  providers: [],
})
export class GatewayModule {
  constructor(
    @InjectRequestsService()
    private readonly requestsService: RequestsService,
  ) {}
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(this.requestsService.getMiddleware())
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
