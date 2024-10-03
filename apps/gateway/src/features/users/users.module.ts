import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClsTransactionalModule } from '../../common/modules/cls-transactional.module';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../../common/config/constants/jwt-basic-constants';
import { UsersController } from './api/users.controller';
import { AuthService } from '../auth/application/auth.service';
import { UsersRepository } from './infrastructure/users.repository';
import { CryptoService } from '../../common/utils/crypto.service';
import { FileStorageService } from '../../common/utils/file-storage.service';
import { AvatarStorageService } from './infrastructure/avatar-storage.service';
import { UploadAvatarUseCase } from './application/use-cases/upload-avatar.use-case';
import { AvatarRepository } from './infrastructure/avatar.repository';
import { FillingUserProfileUseCase } from './application/use-cases/filling-user-profile.use-case';
import { GetProfileInfoUseCase } from './application/use-cases/get-profile-info.use-case';
import { UsersQueryRepository } from './infrastructure/users.query-repository';
import { DeleteAvatarUseCase } from './application/use-cases/delete-avatar.use-case';

const useCases = [
  UploadAvatarUseCase,
  FillingUserProfileUseCase,
  GetProfileInfoUseCase,
  DeleteAvatarUseCase,
];

const repositories = [UsersRepository, UsersQueryRepository, AvatarRepository];

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
    JwtStrategy,
    AuthService,
    CryptoService,
    FileStorageService,
    AvatarStorageService,
    ...useCases,
    ...repositories,
  ],
  exports: [],
})
export class UsersModule {}
