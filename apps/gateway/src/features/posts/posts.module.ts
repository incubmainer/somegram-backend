import { Module } from '@nestjs/common';
import { PostsController } from './api/posts.controller';
import { PostsRepository } from './infrastructure/posts.repository';
import { UpdatePostUseCase } from './application/use-cases/update-post.use-case';
import { DeletePostUseCase } from './application/use-cases/delete-post.use-case';
import { PostsQueryRepository } from './infrastructure/posts.query-repository';
import { GetPostUseCase } from './application/queryBus/get-public-post.use-case';
import { GetPostsByUserUseCase } from './application/queryBus/get-posts-by-user.use-case';
import { AddPostUseCase } from './application/use-cases/add-post.use-case';
import { PublicPostsController } from './api/public-posts.controller';
import { GetPublicPostsByUserUseCase } from './application/queryBus/get-public-posts.use-case';
import { PostFileFactory } from './domain/files.factory';
import { UsersModule } from '../users/users.module';

const queryHandlers = [
  GetPostUseCase,
  GetPostsByUserUseCase,
  GetPublicPostsByUserUseCase,
];

const handlers = [UpdatePostUseCase, DeletePostUseCase, AddPostUseCase];

const postFileFactoryProvider = {
  provide: 'PostFileFactory',
  useValue: PostFileFactory,
};

@Module({
  imports: [UsersModule],
  controllers: [PostsController, PublicPostsController],
  providers: [
    ...queryHandlers,
    ...handlers,
    postFileFactoryProvider,
    PostsRepository,
    PostsQueryRepository,
  ],
  exports: [],
})
export class PostsModule {}
