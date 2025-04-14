import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { Pagination, PaginatorService } from '@app/paginator';
import { AdminPostCommentRawModel } from '../../../domain/types';
import { CommentsQueryStringInput } from '../../../../resolvers/comments/models/comments-query-string-input';
import { PostsRepository } from '../../../infrastructure/posts.repository';
import { PostsCommentGraphqlQueryRepository } from '../../../infrastructure/posts-comment-graphql.query-repository';

export class GetAdminPostCommentsQuery {
  constructor(
    public postId: string,
    public queryString: CommentsQueryStringInput,
  ) {}
}

@QueryHandler(GetAdminPostCommentsQuery)
export class GetAdminPostCommentsUseCase
  implements
    IQueryHandler<
      GetAdminPostCommentsQuery,
      AppNotificationResultType<Pagination<AdminPostCommentRawModel[]>>
    >
{
  constructor(
    private readonly logger: LoggerService,
    private readonly postsRepository: PostsRepository,
    private readonly appNotification: ApplicationNotification,
    private readonly paginatorService: PaginatorService,
    private readonly postsCommentGraphqlQueryRepository: PostsCommentGraphqlQueryRepository,
  ) {
    this.logger.setContext(GetAdminPostCommentsUseCase.name);
  }
  async execute(
    command: GetAdminPostCommentsQuery,
  ): Promise<
    AppNotificationResultType<Pagination<AdminPostCommentRawModel[]>>
  > {
    this.logger.debug(
      'Execute: get post comments by admin command',
      this.execute.name,
    );
    const { queryString, postId } = command;

    try {
      const post = await this.postsRepository.getPostById(postId);
      if (!post) return this.appNotification.notFound();

      const { pageSize, pageNumber, sortBy, sortDirection } = queryString;

      const skip = (pageNumber - 1) * pageSize;

      const { comments, count } =
        await this.postsCommentGraphqlQueryRepository.getCommentsForPostByPostId(
          postId,
          sortBy,
          sortDirection,
          skip,
          pageSize,
        );

      const result: Pagination<AdminPostCommentRawModel[]> =
        this.paginatorService.create(pageNumber, pageSize, count, comments);

      return this.appNotification.success(result);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
