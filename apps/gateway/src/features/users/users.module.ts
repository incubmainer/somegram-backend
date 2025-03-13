import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { UsersRepository } from './infrastructure/users.repository';
import { UploadAvatarUseCase } from './application/use-cases/upload-avatar.use-case';
import { FillingUserProfileUseCase } from './application/use-cases/filling-user-profile.use-case';
import { UsersQueryRepository } from './infrastructure/users.query-repository';
import { DeleteAvatarUseCase } from './application/use-cases/delete-avatar.use-case';
import { PublicUsersController } from './api/public-users.controller';
import { GetProfileInfoUseCase } from './application/queryBus/get-profile-info.use-case';
import { GetPublicProfileInfoUseCase } from './application/queryBus/get-public-profile-info.use-case';
import { GetTotalRegisteredUserQueryHandler } from './application/queryBus/get-total-registered-users-count.use-case';

const queryHandlers = [
  GetProfileInfoUseCase,
  GetPublicProfileInfoUseCase,
  GetTotalRegisteredUserQueryHandler,
];

const handlers = [
  UploadAvatarUseCase,
  FillingUserProfileUseCase,
  DeleteAvatarUseCase,
];

@Module({
  imports: [],
  controllers: [UsersController, PublicUsersController],
  providers: [
    ...handlers,
    ...queryHandlers,
    UsersRepository,
    UsersQueryRepository,
  ],
  exports: [UsersRepository, UsersQueryRepository],
})
export class UsersModule {}
