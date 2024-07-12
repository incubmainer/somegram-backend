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
import { RegistrationConfirmationUseCase } from './application/use-cases/registration-confirmation.use-case';
import { RestorePasswordUseCase } from './application/use-cases/restore-password.use-case';
import { RecapchaService } from '../../common/utils/recapcha.service';
import { MockRecapchaService } from '../../common/utils/mock-recapcha.service';
import { RestorePasswordConfirmationUseCase } from './application/use-cases/restore-password-confirmation.use-case';

@Module({
  imports: [CqrsModule, ClsTransactionalModule, EmailModule],
  controllers: [AuthController],
  providers: [
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
  ],
})
export class AuthModule {}
