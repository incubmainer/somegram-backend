import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './api/auth.controller';
import { RegistrationUseCase } from './application/use-cases/registration.use-case';
import { UserRepository } from './infrastructure/user.repository';
import { ClsTransactionalModule } from '../../common/modules/cls-transactional.module';
import { CryptoAuthService } from './infrastructure/crypto-auth.service';
import { CryptoService } from '../../common/utils/crypto.service';
import { EmailAuthService } from './infrastructure/email-auth.service';
import { EmailModule } from '../../common/modules/email.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthService } from './application/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { LoginUserUseCase } from './application/use-cases/login-use-case';
import { SecurityDevicesRepository } from '../security-devices/infrastructure/security-devices.repository';
import { SecurityDevicesService } from '../security-devices/application/security-devices.service';
import { SecurityDevicesController } from '../security-devices/api/security-devices.controller';
import {
  jwtConstants,
  tokensLivesConstants,
} from '../../common/config/constants/jwt-basic-constants';
import { RegistrationConfirmationUseCase } from './application/use-cases/registration-confirmation.use-case';
import { GoogleAuthService } from './infrastructure/google-auth.service';

const useCases = [LoginUserUseCase];
@Module({
  imports: [
    CqrsModule,
    ClsTransactionalModule,
    EmailModule,
    JwtModule.register({
      global: false,
      secret: jwtConstants.JWT_SECRET,
      signOptions: { expiresIn: tokensLivesConstants['2hours'] },
    }),
  ],
  controllers: [AuthController, SecurityDevicesController],
  providers: [
    LocalStrategy,
    JwtStrategy,
    UserRepository,
    RegistrationUseCase,
    RegistrationConfirmationUseCase,
    CryptoAuthService,
    CryptoService,
    EmailAuthService,
    AuthService,
    SecurityDevicesRepository,
    SecurityDevicesService,
    ...useCases,
    GoogleAuthService,
  ],
})
export class AuthModule {}
