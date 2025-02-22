import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../../common/guards/jwt/jwt.strategy';
import { UsersController } from './api/users.controller';
import { AuthService } from '../auth/application/auth.service';
import { UsersRepository } from './infrastructure/users.repository';
import { UploadAvatarUseCase } from './application/use-cases/upload-avatar.use-case';
import { FillingUserProfileUseCase } from './application/use-cases/filling-user-profile.use-case';
import { UsersQueryRepository } from './infrastructure/users.query-repository';
import { DeleteAvatarUseCase } from './application/use-cases/delete-avatar.use-case';
import { PublicUsersController } from './api/public-users.controller';
import { GetProfileInfoUseCase } from './application/queryBus/get-profile-info.use-case';
import { GetPublicProfileInfoUseCase } from './application/queryBus/get-public-profile-info.use-case';

const useCases = [
  UploadAvatarUseCase,
  FillingUserProfileUseCase,
  GetProfileInfoUseCase,
  DeleteAvatarUseCase,
  GetPublicProfileInfoUseCase,
];

const services = [AuthService];

@Module({
  imports: [],
  controllers: [UsersController, PublicUsersController],
  providers: [
    JwtStrategy,
    ...services,
    ...useCases,
    UsersRepository,
    UsersQueryRepository,
  ],
  exports: [UsersRepository, UsersQueryRepository],
})
export class UsersModule {}
