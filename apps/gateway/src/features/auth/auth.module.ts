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
import { LogoutUseCase } from './application/use-cases/logout-use-case';
import { RestorePasswordUseCase } from './application/use-cases/restore-password.use-case';
import { RecapchaService } from '../../common/utils/recapcha.service';
import { MockRecapchaService } from '../../common/utils/mock-recapcha.service';
import { RestorePasswordConfirmationUseCase } from './application/use-cases/restore-password-confirmation.use-case';
import { GithubStrategy } from './strategies/github.strategy';
import { AuthWithGithubUseCase } from './application/use-cases/auth-with-github-use-case';
import { LoginByGoogleUseCase } from './application/use-cases/login-by-google.use-case';
import { GoogleStrategy } from './strategies/google.strategy';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token-use-case';

const useCases = [
  LoginUserUseCase,
  LogoutUseCase,
  AuthWithGithubUseCase,
  LoginByGoogleUseCase,
  RefreshTokenUseCase,
];

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
    GithubStrategy,
    GoogleStrategy,
    UserRepository,
    RegistrationUseCase,
    RegistrationConfirmationUseCase,
    RestorePasswordUseCase,
    {
      provide: RecapchaService,
      useClass:
        process.env.NODE_ENV === 'production'
          ? RecapchaService
          : MockRecapchaService,
    },
    RestorePasswordConfirmationUseCase,
    CryptoAuthService,
    CryptoService,
    EmailAuthService,
    AuthService,
    SecurityDevicesRepository,
    SecurityDevicesService,
    ...useCases,
  ],
})
export class AuthModule {}
