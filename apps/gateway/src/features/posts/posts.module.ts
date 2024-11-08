import { Module } from '@nestjs/common';
import { PostsController } from './api/posts.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule } from '@nestjs/microservices';

import { ClsTransactionalModule } from '../../common/modules/cls-transactional.module';
import { PostsRepository } from './infrastructure/posts.repository';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { UpdatePostUseCase } from './application/use-cases/update-post.use-case';
import { DeletePostUseCase } from './application/use-cases/delete-post.use-case';
import { UsersQueryRepository } from '../users/infrastructure/users.query-repository';
import { PostsQueryRepository } from './infrastructure/posts.query-repository';
import { GetPostUseCase } from './application/use-cases/queryBus/get-public-post.use-case';
import { GetPostsByUserUseCase } from './application/use-cases/queryBus/get-posts-by-user.use-case';
import { AddPostUseCase } from './application/use-cases/add-post.use-case';
import { PublicPostsController } from './api/public-posts.controller';
import { GetPublicPostsByUserUseCase } from './application/use-cases/queryBus/get-public-posts.use-case';
import { photoServiceOptions } from '../../common/config/module-options/get-photo-service.options';
import { PhotoServiceAdapter } from '../../common/adapter/photo-service.adapter';

const useCases = [
  UpdatePostUseCase,
  DeletePostUseCase,
  GetPostUseCase,
  GetPostsByUserUseCase,
  GetPublicPostsByUserUseCase,
  AddPostUseCase,
];
const repositories = [
  PostsRepository,
  PostsQueryRepository,
  UsersRepository,
  UsersQueryRepository,
];

const services = [PhotoServiceAdapter];

@Module({
  imports: [
    ClientsModule.registerAsync([photoServiceOptions()]),
    CqrsModule,
    ClsTransactionalModule,
  ],
  controllers: [PostsController, PublicPostsController],
  providers: [...services, ...useCases, ...repositories],
  exports: [],
})
export class PostsModule {}
