import { Module } from '@nestjs/common';
import { AuthController } from './api/auth.controller';
import { RegisterUseCase } from './application/register/use-case';
import { CryptoAuthService as CryptoAuthServiceI } from './domain/crypto-auth.service';
import { CryptoAuthService } from './infrastructure/crypto-auth.service';
import { UserRepository } from './domain/user.repository';
import { PrismaUserRepository } from './infrastructure/prisma-user.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { UserRegisteredEventHandler } from './application/event-handlers/user-registered.event-handler';
import { EmailServiceI } from './domain/email.service';
import { EmailService } from './infrastructure/email.service';

@Module({
  imports: [CqrsModule],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    UserRegisteredEventHandler,
    {
      provide: CryptoAuthServiceI,
      useClass: CryptoAuthService,
    },
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
    {
      provide: EmailServiceI,
      useClass: EmailService,
    },
  ],
})
export class AuthModule { }
