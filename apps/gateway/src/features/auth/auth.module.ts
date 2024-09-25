import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './api/auth.controller';
import { RegistrationUseCase } from './application/use-cases/registration.use-case';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { ClsTransactionalModule } from '../../common/modules/cls-transactional.module';
import { CryptoAuthService } from './infrastructure/crypto-auth.service';
import { CryptoService } from '../../common/utils/crypto.service';
import { EmailAuthService } from './infrastructure/email-auth.service';
import { EmailModule } from '../../common/modules/email.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './application/auth.service';
import { LoginUserUseCase } from './application/use-cases/login-use-case';
import { SecurityDevicesRepository } from '../security-devices/infrastructure/security-devices.repository';
import { SecurityDevicesService } from '../security-devices/application/security-devices.service';
import { SecurityDevicesController } from '../security-devices/api/security-devices.controller';
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
import { RenewTokensUseCase } from './application/use-cases/refresh-token-use-case';
import { GetInfoAboutMeUseCase } from './application/use-cases/get-info-about-me.use-case';
import { CreateTokensUseCase } from './application/use-cases/create-token.use-case';
import { AddUserDeviceUseCase } from './application/use-cases/add-user-device.use-case';
import { RegistrationEmailResendingUseCase } from './application/use-cases/registration-email-resending.use-case';
import { CheckRefreshTokenUseCase } from './application/use-cases/check-refresh-token';
import { UsersQueryRepository } from '../users/infrastructure/users.query-repository';

const services = [
  AuthService,
  JwtService,
  CryptoAuthService,
  CryptoService,
  EmailAuthService,
  SecurityDevicesService,
];
const useCases = [
  LoginUserUseCase,
  LogoutUseCase,
  AuthWithGithubUseCase,
  LoginByGoogleUseCase,
  RenewTokensUseCase,
  GetInfoAboutMeUseCase,
  CreateTokensUseCase,
  AddUserDeviceUseCase,
  RegistrationUseCase,
  RegistrationConfirmationUseCase,
  RestorePasswordUseCase,
  RestorePasswordConfirmationUseCase,
  RegistrationEmailResendingUseCase,
  CheckRefreshTokenUseCase,
];

const strategy = [JwtStrategy, GithubStrategy, GoogleStrategy];

const repositories = [
  UsersRepository,
  UsersQueryRepository,
  SecurityDevicesRepository,
];

@Module({
  imports: [CqrsModule, ClsTransactionalModule, EmailModule, PassportModule],
  controllers: [AuthController, SecurityDevicesController],
  providers: [
    ...services,
    ...strategy,
    ...useCases,
    ...repositories,
    {
      provide: RecapchaService,
      useClass:
        process.env.NODE_ENV === 'production'
          ? RecapchaService
          : MockRecapchaService,
    },
  ],
})
export class AuthModule {}
