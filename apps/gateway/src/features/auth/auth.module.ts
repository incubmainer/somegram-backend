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
import { jwtConstants, tokensLivesConstants } from './constants/constants';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthService } from './application/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { LoginUserUseCase } from './application/use-cases/login-use-case';

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
  controllers: [AuthController],
  providers: [
    LocalStrategy,
    JwtStrategy,
    UserRepository,
    RegistrationUseCase,
    CryptoAuthService,
    CryptoService,
    EmailAuthService,
    AuthService,
    ...useCases,
  ],
})
export class AuthModule {}
