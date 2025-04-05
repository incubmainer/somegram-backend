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
import { PostCommentController } from './api/post-comment.controller';
import { AddPostCommentUseCase } from './application/use-cases/add-comment.use-case';
import { PostsCommentRepository } from './infrastructure/posts-comment.repository';
import { PostsCommentQueryRepository } from './infrastructure/posts-comment.query-repository';
import { AddAnswerForCommentUseCase } from './application/use-cases/add-answer-for-comment.use-case';
import { GetPostCommentsByPostIdUseCase } from './application/queryBus/get-post-comments-by-post-id.use-case';
import { CommentPostOutputDtoMapper } from './api/dto/output-dto/comment-post.output-dto';
import { AddLikeDislikeCommentUseCase } from './application/use-cases/add-like-dislike-comment.use-case';
import { PostsLikeCommentRepository } from './infrastructure/posts-like-comment.repository';
import { CommentAnswersOutputDtoMapper } from './api/dto/output-dto/comment-answers.output-dto';
import { GetCommentAnswersByCommentIdUseCase } from './application/queryBus/get-comment-answers-by-comment-id.use-case';
import { PostsLikeRepository } from './infrastructure/posts-like.repository';
import { AddLikePostUseCase } from './application/use-cases/add-like-post.use-case';

const queryHandlers = [
  GetPostUseCase,
  GetPostsByUserUseCase,
  GetPublicPostsByUserUseCase,
  GetAdminPostsByUserUseCase,
  GetAdminPostsByIdUseCase,
  GetPostCommentsByPostIdUseCase,
  GetCommentAnswersByCommentIdUseCase,
];

const handlers = [
  UpdatePostUseCase,
  DeletePostUseCase,
  AddPostUseCase,
  AddPostCommentUseCase,
  AddAnswerForCommentUseCase,
  AddLikeDislikeCommentUseCase,
  AddLikePostUseCase,
];

const postFileFactoryProvider = {
  provide: 'PostFileFactory',
  useValue: PostFileFactory,
};

@Module({
  imports: [UsersModule],
  controllers: [PostsController, PublicPostsController, PostCommentController],
  providers: [
    ...queryHandlers,
    ...handlers,
    postFileFactoryProvider,
    PostsRepository,
    PostsQueryRepository,
    PostsGraphqlQueryRepository,
    PostsCommentRepository,
    PostsCommentQueryRepository,
    CommentPostOutputDtoMapper,
    PostsLikeCommentRepository,
    CommentAnswersOutputDtoMapper,
    PostsLikeRepository,
  ],
  exports: [],
})
export class PostsModule {}
