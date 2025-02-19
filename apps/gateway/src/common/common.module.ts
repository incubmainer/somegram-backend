import { Global, Module } from '@nestjs/common';
import { RefreshJWTAccessGuard } from './guards/jwt/jwt-refresh-auth-guard';
import { JwtRefreshTokenStrategyStrategy } from './guards/jwt/jwt-refresh-auth-strategy';
import { UsersModule } from '../features/users/users.module';
import { SecurityDevicesModule } from '../features/security-devices/security-devices.module';
import { CqrsModule } from '@nestjs/cqrs';
import { PhotoServiceAdapter } from './adapter/photo-service.adapter';
import { ClientsModule } from '@nestjs/microservices';
import { photoServiceOptions } from '../settings/configuration/photo-service.options';
import { CommandExecutorService } from './services/command-executor-service';
import { WsJwtAuthGuard } from './guards/ws-jwt/ws-jwt-auth.guard';
import { WsJwtStrategy } from './guards/ws-jwt/ws-jwt-auth.startegy';
import { clsModule } from './services/cls-service/cls.module';
import { PrismaService } from './services/prisma-service/prisma.service';
import { EmailSender } from './utils/email.sender';
import { DateFormatter } from './utils/date-formatter.util';
import { JwtStrategy } from './guards/jwt/jwt.strategy';
import { GithubStrategy } from './guards/jwt/github.strategy';
import { GoogleStrategy } from './guards/jwt/google.strategy';

const strategy = [JwtStrategy, GithubStrategy, GoogleStrategy];

@Global()
@Module({
  imports: [
    clsModule,
    /////////////////////////////
    UsersModule,
    SecurityDevicesModule,
    CqrsModule,
    ClientsModule.registerAsync([photoServiceOptions()]),
    //ClsTransactionalModule,
  ],
  controllers: [],
  providers: [
    PrismaService,
    ...strategy,
    ////////////////////////////
    PhotoServiceAdapter,
    JwtRefreshTokenStrategyStrategy,
    RefreshJWTAccessGuard,
    CommandExecutorService,
    WsJwtAuthGuard,
    WsJwtStrategy,
    EmailSender,
    DateFormatter,
  ],
  exports: [
    PrismaService,
    ...strategy,
    ////////////////////////////
    CqrsModule,
    JwtRefreshTokenStrategyStrategy,
    RefreshJWTAccessGuard,
    PhotoServiceAdapter,
    CommandExecutorService,
    WsJwtAuthGuard,
    EmailSender,
    WsJwtStrategy,
    DateFormatter,
  ],
})
export class CommonModule {}
