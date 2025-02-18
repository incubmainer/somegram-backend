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
    ////////////////////////////
    PhotoServiceAdapter,
    JwtRefreshTokenStrategyStrategy,
    RefreshJWTAccessGuard,
    CommandExecutorService,
    WsJwtAuthGuard,
    WsJwtStrategy,
    EmailSender,
  ],
  exports: [
    PrismaService,
    ////////////////////////////
    CqrsModule,
    JwtRefreshTokenStrategyStrategy,
    RefreshJWTAccessGuard,
    PhotoServiceAdapter,
    CommandExecutorService,
    WsJwtAuthGuard,
    EmailSender,
    WsJwtStrategy,
  ],
})
export class CommonModule {}
