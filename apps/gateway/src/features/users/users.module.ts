import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { jwtConstants } from '../../common/constants/jwt-basic-constants';
import { UsersController } from './api/users.controller';
import { AuthService } from '../auth/application/auth.service';
import { UsersRepository } from './infrastructure/users.repository';
import { CryptoService } from '../../common/utils/crypto.service';
import { UploadAvatarUseCase } from './application/use-cases/upload-avatar.use-case';
import { FillingUserProfileUseCase } from './application/use-cases/filling-user-profile.use-case';
import { UsersQueryRepository } from './infrastructure/users.query-repository';
import { DeleteAvatarUseCase } from './application/use-cases/delete-avatar.use-case';
import { PublicUsersController } from './api/public-users.controller';
import { GetProfileInfoUseCase } from './application/use-cases/queryBus/get-profile-info.use-case';
import { GetPublicProfileInfoUseCase } from './application/use-cases/queryBus/get-public-profile-info.use-case';

const useCases = [
  UploadAvatarUseCase,
  FillingUserProfileUseCase,
  GetProfileInfoUseCase,
  DeleteAvatarUseCase,
  GetPublicProfileInfoUseCase,
];

const repositories = [UsersRepository, UsersQueryRepository];

const services = [AuthService, CryptoService];

@Module({
  imports: [
    CqrsModule,
    JwtModule.register({
      global: false,
      secret: jwtConstants.JWT_SECRET,
    }),
  ],
  controllers: [UsersController, PublicUsersController],
  providers: [JwtStrategy, ...services, ...useCases, ...repositories],
  exports: [UsersRepository],
})
export class UsersModule {}
