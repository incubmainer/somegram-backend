import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AuthModule } from './features/auth/auth.module';
import { UsersModule } from './features/users/users.module';
import { PostsModule } from './features/posts/posts.module';
import { configModule } from './settings/configuration/config.module';
import {
  AsyncLocalStorageService,
  LoggerModule,
  RequestsContextMiddleware,
} from '@app/logger';
import { SecurityDevicesModule } from './features/security-devices/security-devices.module';
import { CountryCatalogModule } from './features/country-catalog/country-catalog.module';
import { ApplicationNotificationModule } from '@app/application-notification';
import { CommonModule } from './common/common.module';
import { SubscriptionsModule } from './features/subscriptions/subscriptions.module';

@Module({
  imports: [
    SecurityDevicesModule,
    configModule,
    AuthModule,
    UsersModule,
    PostsModule,
    ApplicationNotificationModule,
    CountryCatalogModule,
    SubscriptionsModule,
    CommonModule,
    LoggerModule.forRoot('Gateway'),
  ],
  controllers: [],
  providers: [AsyncLocalStorageService],
})
export class GatewayModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestsContextMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
