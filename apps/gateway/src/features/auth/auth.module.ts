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

@Module({
  imports: [CqrsModule, ClsTransactionalModule, EmailModule],
  controllers: [AuthController],
  providers: [
    UserRepository,
    RegistrationUseCase,
    RegistrationConfirmationUseCase,
    CryptoAuthService,
    CryptoService,
    EmailAuthService,
  ],
})
export class AuthModule { }
