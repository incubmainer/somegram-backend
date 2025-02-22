import { Module } from '@nestjs/common';
import { AuthController } from './api/auth.controller';
import { RegistrationUseCase } from './application/use-cases/registration.use-case';
import { AuthService } from './application/auth.service';
import { LoginUserUseCase } from './application/use-cases/login-use-case';
import { RegistrationConfirmationUseCase } from './application/use-cases/registration-confirmation.use-case';
import { LogoutUseCase } from './application/use-cases/logout-use-case';
import { RestorePasswordUseCase } from './application/use-cases/restore-password.use-case';
import { RestorePasswordConfirmationUseCase } from './application/use-cases/restore-password-confirmation.use-case';
import { AuthWithGithubUseCase } from './application/use-cases/auth-with-github-use-case';
import { LoginByGoogleUseCase } from './application/use-cases/login-by-google.use-case';
import { RenewTokensUseCase } from './application/use-cases/refresh-token-use-case';
import { RegistrationEmailResendingUseCase } from './application/use-cases/registration-email-resending.use-case';
import { RegistrationUserSuccessEventHandler } from './application/events/registration-user-success.envent';
import { RegisteredUserEventHandler } from './application/events/registred-user.envent';
import { NotificationModule } from '../notification/notification.module';
import { UserConfirmationRepository } from './infrastructure/user-confirmation.repository';
import { UserResetPasswordRepository } from './infrastructure/user-reset-password.repository';
import { RestorePasswordEventHandler } from './application/events/restore-password.envent';
import { SecurityDevicesModule } from '../security-devices/security-devices.module';
import { UsersModule } from '../users/users.module';

const useCases = [
  LoginUserUseCase,
  LogoutUseCase,
  AuthWithGithubUseCase,
  LoginByGoogleUseCase,
  RenewTokensUseCase,
  RegistrationUseCase,
  RegistrationConfirmationUseCase,
  RestorePasswordUseCase,
  RestorePasswordConfirmationUseCase,
  RegistrationEmailResendingUseCase,
];

const events = [
  RegistrationUserSuccessEventHandler,
  RegisteredUserEventHandler,
  RestorePasswordEventHandler,
];

@Module({
  imports: [NotificationModule, SecurityDevicesModule, UsersModule],
  controllers: [AuthController],
  providers: [
    UserConfirmationRepository,
    UserResetPasswordRepository,
    AuthService,
    ...useCases,
    ...events,
  ],
})
export class AuthModule {}
