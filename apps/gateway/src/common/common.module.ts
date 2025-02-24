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
import { DateFormatter } from './utils/date-formatter.util';
import { JwtStrategy } from './guards/jwt/jwt.strategy';
import { GithubStrategy } from './guards/jwt/github.strategy';
import { GoogleStrategy } from './guards/jwt/google.strategy';
import { JwtService } from '@nestjs/jwt';
import { MeAccessTokenStrategy } from './guards/jwt/jwt-me-access-token.strategy';
import { ApplicationNotificationModule } from '@app/application-notification';
import { paymentsServiceOptions } from '../settings/configuration/get-pyments-service.options';
import { PaymentsServiceAdapter } from './adapter/payment-service.adapter';

const strategy = [
  JwtStrategy,
  GithubStrategy,
  GoogleStrategy,
  MeAccessTokenStrategy,
  JwtRefreshTokenStrategyStrategy,
  WsJwtStrategy,
];
const clientsModule = ClientsModule.registerAsync([
  photoServiceOptions(),
  paymentsServiceOptions(),
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
  ],
  controllers: [],
  providers: [
    PrismaService,
    ...strategy,

    PhotoServiceAdapter,
    DateFormatter,
    JwtService,
    PaymentsServiceAdapter,
  ],
  exports: [
    PrismaService,
    ...strategy,
    clientsModule,
    ApplicationNotificationModule,
    CqrsModule,
    PhotoServiceAdapter,
    DateFormatter,
    JwtService,
    PaymentsServiceAdapter,
  ],
})
export class CommonModule {}
