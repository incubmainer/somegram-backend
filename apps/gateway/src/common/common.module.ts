import { Global, Module } from '@nestjs/common';
import { JwtRefreshTokenStrategyStrategy } from './guards/jwt/jwt-refresh-auth-strategy';
import { UsersModule } from '../features/users/users.module';
import { SecurityDevicesModule } from '../features/security-devices/security-devices.module';
import { CqrsModule } from '@nestjs/cqrs';
import { PhotoServiceAdapter } from './adapter/photo-service.adapter';
import { ClientsModule } from '@nestjs/microservices';
import { photoServiceOptions } from '../settings/configuration/photo-service.options';
import { WsJwtStrategy } from './guards/ws-jwt/ws-jwt-auth.startegy';
import { clsModule } from './services/cls-service/cls.module';
import { PrismaService } from './services/prisma-service/prisma.service';
import { JwtStrategy } from './guards/jwt/jwt.strategy';
import { GithubStrategy } from './guards/jwt/github.strategy';
import { GoogleStrategy } from './guards/jwt/google.strategy';
import { JwtService } from '@nestjs/jwt';
import { MeAccessTokenStrategy } from './guards/jwt/jwt-me-access-token.strategy';
import { ApplicationNotificationModule } from '@app/application-notification';
import { paymentsServiceOptions } from '../settings/configuration/get-pyments-service.options';
import { PaymentsServiceAdapter } from './adapter/payment-service.adapter';
import { DateFormaterModule } from '@app/date-formater';
import { PubSub } from 'graphql-subscriptions';
import { WsBasicGqlGuard } from './guards/graphql/ws-basic-gql.guard';
import { JwtRefreshTokenVerifyUserStrategy } from './guards/jwt/jwt-refresh-verify-user-strategy';
import { MessengerServiceAdapter } from './adapter/messenger-service.adapter';
import { messengerServiceOptions } from '../settings/configuration/messenger-service.options';

const strategy = [
  JwtStrategy,
  GithubStrategy,
  GoogleStrategy,
  MeAccessTokenStrategy,
  JwtRefreshTokenStrategyStrategy,
  WsJwtStrategy,
  JwtRefreshTokenVerifyUserStrategy,
];
const clientsModule = ClientsModule.registerAsync([
  photoServiceOptions(),
  paymentsServiceOptions(),
  messengerServiceOptions(),
]);

@Global()
@Module({
  imports: [
    clsModule,
    clientsModule,
    ApplicationNotificationModule,
    UsersModule,
    SecurityDevicesModule,
    CqrsModule,
    DateFormaterModule,
  ],
  controllers: [],
  providers: [
    PubSub,
    PrismaService,
    ...strategy,
    PhotoServiceAdapter,
    JwtService,
    PaymentsServiceAdapter,
    WsBasicGqlGuard,
    MessengerServiceAdapter,
  ],
  exports: [
    PubSub,
    PrismaService,
    ...strategy,
    clientsModule,
    ApplicationNotificationModule,
    CqrsModule,
    PhotoServiceAdapter,
    JwtService,
    PaymentsServiceAdapter,
    MessengerServiceAdapter,
    DateFormaterModule,
    WsBasicGqlGuard,
  ],
})
export class CommonModule {}
