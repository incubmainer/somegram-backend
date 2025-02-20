import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './api/auth.controller';
import { RegistrationUseCase } from './application/use-cases/registration.use-case';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { EmailAuthService } from './infrastructure/email-auth.service';
import { AuthService } from './application/auth.service';
import { LoginUserUseCase } from './application/use-cases/login-use-case';
import { SecurityDevicesRepository } from '../security-devices/infrastructure/security-devices.repository';
import { SecurityDevicesController } from '../security-devices/api/security-devices.controller';
import { RegistrationConfirmationUseCase } from './application/use-cases/registration-confirmation.use-case';
import { LogoutUseCase } from './application/use-cases/logout-use-case';
import { RestorePasswordUseCase } from './application/use-cases/restore-password.use-case';
import { RecapchaService } from '../../common/utils/recapcha.service';
import { MockRecapchaService } from '../../common/utils/mock-recapcha.service';
import { RestorePasswordConfirmationUseCase } from './application/use-cases/restore-password-confirmation.use-case';
import { AuthWithGithubUseCase } from './application/use-cases/auth-with-github-use-case';
import { LoginByGoogleUseCase } from './application/use-cases/login-by-google.use-case';
import { RenewTokensUseCase } from './application/use-cases/refresh-token-use-case';
import { GetInfoAboutMeUseCase } from './application/use-cases/get-info-about-me.use-case';
import { CreateTokensUseCase } from './application/use-cases/create-token.use-case';
import { AddUserDeviceUseCase } from './application/use-cases/add-user-device.use-case';
import { RegistrationEmailResendingUseCase } from './application/use-cases/registration-email-resending.use-case';
import { CheckRefreshTokenUseCase } from './application/use-cases/check-refresh-token';
import { UsersQueryRepository } from '../users/infrastructure/users.query-repository';
import { RegistrationUserSuccessEventHandler } from './application/events/registration-user-success.envent';
import { RegisteredUserEventHandler } from './application/events/registred-user.envent';
import { NotificationModule } from '../notification/notification.module';

const services = [AuthService, JwtService, EmailAuthService];
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

const events = [
  RegistrationUserSuccessEventHandler,
  RegisteredUserEventHandler,
];

const repositories = [
  UsersRepository,
  UsersQueryRepository,
  SecurityDevicesRepository,
];

@Module({
  imports: [CqrsModule, PassportModule, NotificationModule],
  controllers: [AuthController, SecurityDevicesController],
  providers: [
    ...services,
    ...useCases,
    ...repositories,
    ...events,
    {
      provide: RecapchaService,
      useClass:
        process.env.NODE_ENV === 'production' // TODO:
          ? RecapchaService
          : MockRecapchaService,
    },
  ],
})
export class AuthModule {}
