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
import { NotificationModule } from './features/notification/notification.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GatewayResolver } from './gateway.resolver';
import { AuthResolver } from './resolvers/auth/auth.resolver';
import { UsersResolver } from './resolvers/users/users.resolver';
import { PaginatorModule } from '@app/paginator';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DataLoaderInterceptor } from 'nestjs-dataloader/dist';
import { UserAvatarsLoader } from './common/data-loaders/user-avatars-loader';
import { PaymentsResolver } from './resolvers/payments/payments.resolver';
import { UserLoader } from './common/data-loaders/user-loader';
import { PostsPhotosLoader } from './common/data-loaders/posts-photos-loader';
import { PaymentsLoader } from './common/data-loaders/payments-loader';

const resolvers = [
  GatewayResolver,
  AuthResolver,
  UsersResolver,
  PaymentsResolver,
];

const loaders = [
  UserAvatarsLoader,
  UserLoader,
  PostsPhotosLoader,
  PaymentsLoader,
];

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
    PaginatorModule,
    CommonModule,
    LoggerModule.forRoot('Gateway'),
    NotificationModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      installSubscriptionHandlers: true,
      //autoSchemaFile: true,
      autoSchemaFile: 'schema.gql',
      path: '/api/v1/graphql',
    }),
  ],
  controllers: [],
  providers: [
    AsyncLocalStorageService,
    ...resolvers,
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,
    },
    ...loaders,
  ],
})
export class GatewayModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestsContextMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
