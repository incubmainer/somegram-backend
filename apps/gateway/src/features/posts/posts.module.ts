import { Module } from '@nestjs/common';
import { PostsController } from './api/posts.controller';
import { CqrsModule } from '@nestjs/cqrs';
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

@Module({
  imports: [CqrsModule],
  controllers: [PostsController, PublicPostsController],
  providers: [...useCases, ...repositories],
  exports: [PostsQueryRepository],
})
export class PostsModule {}
