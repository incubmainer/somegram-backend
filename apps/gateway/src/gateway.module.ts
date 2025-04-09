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
import { CommonModule } from './common/common.module';
import { SubscriptionsModule } from './features/subscriptions/subscriptions.module';
import { NotificationModule } from './features/notification/notification.module';
import { PaginatorModule } from '@app/paginator';
import { GraphQLModule } from '@nestjs/graphql';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UserAvatarsLoader } from './common/data-loaders/user-avatars-loader';
import { PaymentsLoader } from './common/data-loaders/payments-loader';
import { PostsPhotosLoader } from './common/data-loaders/posts-photos-loader';
import { UserLoader } from './common/data-loaders/user-loader';
import { DataLoaderInterceptor } from 'nestjs-dataloader/dist';
import { UsersResolver } from './features/resolvers/users/users.resolver';
import { PaymentsResolver } from './features/resolvers/payments/payments.resolver';
import { AuthResolver } from './features/resolvers/auth/auth.resolver';
import {
  PostLastLikeResolver,
  PostOwnerResolver,
  PostsResolver,
} from './features/resolvers/posts/posts.resolver';
import { PostsPhotosLoaderByPost } from './common/data-loaders/posts-photos-loader-by-post';
import {
  IWsBasicGqlParams,
  WsBasicGqlGuard,
} from './common/guards/graphql/ws-basic-gql.guard';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from './settings/configuration/configuration';
import { CommentsResolver } from './features/resolvers/comments/comments.resolver';

const resolvers = [
  AuthResolver,
  UsersResolver,
  PaymentsResolver,
  PostsResolver,
  PostOwnerResolver,
  CommentsResolver,
  PostLastLikeResolver,
];

const loaders = [
  UserAvatarsLoader,
  UserLoader,
  PostsPhotosLoader,
  PaymentsLoader,
  PostsPhotosLoaderByPost,
];

const gqlModule = GraphQLModule.forRootAsync<ApolloDriverConfig>({
  driver: ApolloDriver,
  useFactory: async (
    wsBasicGqlGuard: WsBasicGqlGuard,
    configService: ConfigService<ConfigurationType, true>,
  ): Promise<ApolloDriverConfig> => {
    const env = configService.get('envSettings', { infer: true });
    return {
      installSubscriptionHandlers: true,
      autoSchemaFile: 'schema.gql',
      path: '/api/v1/graphql',
      playground: !env.isProductionState(),
      subscriptions: {
        'subscriptions-transport-ws': {
          onConnect: async (connectionParams: IWsBasicGqlParams) => {
            return wsBasicGqlGuard.auth(connectionParams);
          },
        },
      },
    };
  },
  inject: [WsBasicGqlGuard, ConfigService],
});

@Module({
  imports: [
    SecurityDevicesModule,
    configModule,
    AuthModule,
    UsersModule,
    PostsModule,
    CountryCatalogModule,
    SubscriptionsModule,
    CommonModule,
    LoggerModule.forRoot('Gateway'),
    NotificationModule,
    PaginatorModule,
    gqlModule,
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
