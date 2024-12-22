import { Module } from '@nestjs/common';
import { PostsController } from './api/posts.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { PostsRepository } from './infrastructure/posts.repository';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { UpdatePostUseCase } from './application/use-cases/update-post.use-case';
import { DeletePostUseCase } from './application/use-cases/delete-post.use-case';
import { UsersQueryRepository } from '../users/infrastructure/users.query-repository';
import { PostsQueryRepository } from './infrastructure/posts.query-repository';
import { GetPostUseCase } from './application/queryBus/get-public-post.use-case';
import { GetPostsByUserUseCase } from './application/queryBus/get-posts-by-user.use-case';
import { AddPostUseCase } from './application/use-cases/add-post.use-case';
import { PublicPostsController } from './api/public-posts.controller';
import { GetPublicPostsByUserUseCase } from './application/queryBus/get-public-posts.use-case';
import { PostFileFactory } from './domain/files.factory';

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

const postFileFactoryProvider = {
  provide: 'PostFileFactory',
  useValue: PostFileFactory,
};

@Module({
  imports: [CqrsModule],
  controllers: [PostsController, PublicPostsController],
  providers: [...useCases, ...repositories, postFileFactoryProvider],
  exports: [],
})
export class PostsModule {}
