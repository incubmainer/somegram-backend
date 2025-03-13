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
import { GetUserUseCase } from './application/queryBus/graphql/get-user.use-case';
import { GetUsersByIdsUseCase } from './application/queryBus/graphql/get-users-by-ids.use-case';
import { GetUsersUseCase } from './application/queryBus/graphql/get-users.use-case';
import { BanUserUseCase } from './application/use-cases/graphql/ban-user.use-case';
import { RemoveUserUseCase } from './application/use-cases/graphql/remove-user.use-case';
import { UnbanUserUseCase } from './application/use-cases/graphql/unban-user.use-case';
import { UsersGraphqlRepository } from './infrastructure/users.graphql-repository';

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

const useCasesGraphql = [
  RemoveUserUseCase,
  BanUserUseCase,
  UnbanUserUseCase,
  GetUserUseCase,
  GetUsersUseCase,
  GetUsersByIdsUseCase,
];

const repositories = [
  UsersRepository,
  UsersQueryRepository,
  UsersGraphqlRepository,
];

@Module({
  imports: [],
  controllers: [UsersController, PublicUsersController],
  providers: [
    ...handlers,
    ...queryHandlers,
    ...useCasesGraphql,
    ...repositories,
  ],
  exports: [UsersRepository, UsersQueryRepository],
})
export class UsersModule {}
