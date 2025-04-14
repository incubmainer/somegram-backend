import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { Pagination, PaginatorService } from '@app/paginator';
import { PostsCommentQueryRepository } from '../../infrastructure/posts-comment.query-repository';
import {
  CommentPostOutputDto,
  CommentPostOutputDtoMapper,
} from '../../api/dto/output-dto/comment-post.output-dto';
import { GetCommentsForPostQueryDto } from '../../api/dto/input-dto/get-comments-for-post.query.dto';
import { PhotoServiceAdapter } from '../../../../common/adapter/photo-service.adapter';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class GetPostCommentsByPostIdQuery {
  constructor(
    public postId: string,
    public userId: string | null,
    public query: GetCommentsForPostQueryDto,
  ) {}
}

@QueryHandler(GetPostCommentsByPostIdQuery)
export class GetPostCommentsByPostIdUseCase
  implements
    IQueryHandler<
      GetPostCommentsByPostIdQuery,
      AppNotificationResultType<Pagination<CommentPostOutputDto[]>>
    >
{
  constructor(
    private readonly logger: LoggerService,
    private readonly paginatorService: PaginatorService,
    private readonly appNotification: ApplicationNotification,
    private readonly postsCommentQueryRepository: PostsCommentQueryRepository,
    private readonly postsRepository: PostsRepository,
    private readonly commentPostOutputDtoMapper: CommentPostOutputDtoMapper,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
  ) {
    this.logger.setContext(GetPostCommentsByPostIdUseCase.name);
  }
  async execute(
    command: GetPostCommentsByPostIdQuery,
  ): Promise<AppNotificationResultType<Pagination<CommentPostOutputDto[]>>> {
    this.logger.debug(
      'Execute: get post comments by post id command',
      this.execute.name,
    );
    const { postId, userId, query } = command;
    const { pageSize, sortBy, sortDirection, pageNumber } = query;
    try {
      const skip = (pageNumber - 1) * pageSize;

      const post = await this.postsRepository.getPostById(postId);

      if (!post) return this.appNotification.notFound();

      const commentsResult =
        await this.postsCommentQueryRepository.getCommentsForPostByPostId(
          postId,
          userId,
          sortBy,
          sortDirection,
          skip,
          pageSize,
        );

      const { comments, count } = commentsResult;

      if (comments && comments.length > 0) {
        const promises = comments.map(async (comment) => {
          comment.avatar = await this.photoServiceAdapter.getAvatar(
            comment.commentatorId,
          );

          return comment;
        });

        await Promise.all(promises);
      }

      const result: Pagination<CommentPostOutputDto[]> =
        this.paginatorService.create(
          pageNumber,
          pageSize,
          count,
          comments && comments.length > 0
            ? this.commentPostOutputDtoMapper.mapComments(comments)
            : [],
        );

      return this.appNotification.success(result);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
