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
import { ClsTransactionalModule } from './modules/cls-transactional.module';
import { EmailModule } from './modules/email.module';

@Global()
@Module({
  imports: [
    UsersModule,
    SecurityDevicesModule,
    CqrsModule,
    ClientsModule.registerAsync([photoServiceOptions()]),
    ClsTransactionalModule,
    EmailModule,
  ],
  controllers: [],
  providers: [
    PhotoServiceAdapter,
    JwtRefreshTokenStrategyStrategy,
    RefreshJWTAccessGuard,
    CommandExecutorService,
  ],
  exports: [
    CqrsModule,
    JwtRefreshTokenStrategyStrategy,
    RefreshJWTAccessGuard,
    PhotoServiceAdapter,
    ClsTransactionalModule,
    CommandExecutorService,
    EmailModule,
  ],
})
export class CommonModule {}
