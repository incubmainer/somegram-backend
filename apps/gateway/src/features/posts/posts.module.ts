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
import { GetAdminPostsByUserUseCase } from './application/queryBus/graphql/get-admin-posts.use-case';
import { GetAdminPostsByIdUseCase } from './application/queryBus/graphql/get-admin-post-by-id.use-case';
import { PostsGraphqlQueryRepository } from './infrastructure/posts-graphql.query-repository';
import { GetFollowingsPostsUseCase } from './application/queryBus/get-followings-posts.use-case';
import { FollowingPostsController } from './api/following.posts.controller';

const queryHandlers = [
  GetPostUseCase,
  GetPostsByUserUseCase,
  GetPublicPostsByUserUseCase,
  GetAdminPostsByUserUseCase,
  GetAdminPostsByIdUseCase,
  GetFollowingsPostsUseCase,
];

const handlers = [UpdatePostUseCase, DeletePostUseCase, AddPostUseCase];

const postFileFactoryProvider = {
  provide: 'PostFileFactory',
  useValue: PostFileFactory,
};

@Module({
  imports: [UsersModule],
  controllers: [
    PostsController,
    PublicPostsController,
    FollowingPostsController,
  ],
  providers: [
    ...queryHandlers,
    ...handlers,
    postFileFactoryProvider,
    PostsRepository,
    PostsQueryRepository,
    PostsGraphqlQueryRepository,
  ],
  exports: [],
})
export class PostsModule {}
