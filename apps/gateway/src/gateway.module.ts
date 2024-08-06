import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { loadEnvFileNames } from './common/config/load-env-file-names';
import { finalConfig } from './common/config/config';
import { AuthModule } from './features/auth/auth.module';
import { ClsTransactionalModule } from './common/modules/cls-transactional.module';
import { UsersModule } from './features/users/users.module';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,
      envFilePath: loadEnvFileNames(),
      load: [finalConfig],
    }),
    ClsTransactionalModule,
    AuthModule,
    UsersModule,
    AlsModule.forRoot({ isGlobal: true }),
    RequestsModule.forRootAsync({
      useFactory: (als: AlsService) => {
        const config: RequestsModuleOptions = {
          fields: [
            {
              fieldName: 'x-request-id',
              generator: uuidv4,
            },
          ],
          cb: (values, next) => {
            als.start(() => {
              als.setToStore('requestId', values['x-request-id']);
              next();
            });
          },
        };
        return config;
      },
      inject: [AlsService],
    }),
    CustomLoggerModule.forRootAsync({
      useFactory: (als: AlsService) => {
        const config: CustomLoggerModuleOptions = {
          http: {
            enable: false,
            host: '',
            url: '',
            ssl: false,
          },
          console: {
            enable: true,
            color: 'yellow',
          },
          levels: {
            trace: 5,
            debug: 4,
            info: 3,
            warn: 2,
            error: 1,
            fatal: 0,
          },
          loggerLevel: 'info',
          additionalFields: {
            microserviceName: () => 'gateway',
            timestamp: () => new Date().toISOString(),
            requestId: () => als.getFromStore('requestId'),
          },
        };
        return config;
      },
      inject: [AlsService],
    }),
  ],
  controllers: [],
  providers: [],
})
export class GatewayModule {
  constructor(
    @InjectRequestsService()
    private readonly requestsService: RequestsService,
  ) { }
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(this.requestsService.getMiddleware())
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
