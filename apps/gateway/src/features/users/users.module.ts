import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClsTransactionalModule } from '../../common/modules/cls-transactional.module';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { LocalStrategy } from '../auth/strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../../common/config/constants/jwt-basic-constants';
import { UsersController } from './api/users.controller';
import { AuthService } from '../auth/application/auth.service';
import { UserRepository } from '../auth/infrastructure/user.repository';
import { CryptoService } from '../../common/utils/crypto.service';
import { FileStorageService } from '../../common/utils/file-storage.service';
import { AvatarStorageService } from './infrastructure/avatar-storage.service';
import { UploadAvatarUseCase } from './application/use-cases/upload-avatar.use-case';
import { AvatarRepository } from './infrastructure/avatar.repository';

const useCases = [UploadAvatarUseCase];

@Module({
  imports: [
    CqrsModule,
    ClsTransactionalModule,
    JwtModule.register({
      global: false,
      secret: jwtConstants.JWT_SECRET,
    }),
  ],
  controllers: [UsersController],
  providers: [
    LocalStrategy,
    JwtStrategy,
    AuthService,
    UserRepository,
    CryptoService,
    FileStorageService,
    AvatarStorageService,
    ...useCases,
    AvatarRepository,
  ],
})
export class UsersModule { }
