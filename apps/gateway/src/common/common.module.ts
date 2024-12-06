import { Global, Module } from '@nestjs/common';
import { RefreshJWTAccessGuard } from './guards/jwt/jwt-refresh-auth-guard';
import { JwtRefreshTokenStrategyStrategy } from './guards/jwt/jwt-refresh-auth-strategy';
import { UsersModule } from '../features/users/users.module';
import { SecurityDevicesModule } from '../features/security-devices/security-devices.module';

@Global()
@Module({
  imports: [UsersModule, SecurityDevicesModule],
  controllers: [],
  providers: [JwtRefreshTokenStrategyStrategy, RefreshJWTAccessGuard],
  exports: [JwtRefreshTokenStrategyStrategy, RefreshJWTAccessGuard],
})
export class CommonModule {}
