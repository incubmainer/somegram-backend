import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { Pagination, PaginatorService } from '@app/paginator';
import { AdminCommentAnswerRawModel } from '../../../domain/types';

import { PostsCommentGraphqlQueryRepository } from '../../../infrastructure/posts-comment-graphql.query-repository';
import { CommentsQueryStringInput } from '../../../../resolvers/comments/models/comments-query-string-input';

export class GetAdminPostCommentAnswersQuery {
  constructor(
    public commentId: string,
    public queryString: CommentsQueryStringInput,
  ) {}
}

@QueryHandler(GetAdminPostCommentAnswersQuery)
export class GetAdminPostCommentAnswersUseCase
  implements
    IQueryHandler<
      GetAdminPostCommentAnswersQuery,
      AppNotificationResultType<Pagination<AdminCommentAnswerRawModel[]>>
    >
{
  constructor(
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly paginatorService: PaginatorService,
    private readonly postsCommentGraphqlQueryRepository: PostsCommentGraphqlQueryRepository,
  ) {
    this.logger.setContext(GetAdminPostCommentAnswersUseCase.name);
  }
  async execute(
    command: GetAdminPostCommentAnswersQuery,
  ): Promise<
    AppNotificationResultType<Pagination<AdminCommentAnswerRawModel[]>>
  > {
    this.logger.debug(
      'Execute: get post comment answers by admin command',
      this.execute.name,
    );
    const { queryString, commentId } = command;

    try {
      const comment =
        await this.postsCommentGraphqlQueryRepository.getCommentById(commentId);
      if (!comment) return this.appNotification.notFound();

      const { pageSize, pageNumber, sortBy, sortDirection } = queryString;

      const skip = (pageNumber - 1) * pageSize;

      const { comments, count } =
        await this.postsCommentGraphqlQueryRepository.getCommentAnswersByCommentId(
          commentId,
          sortBy,
          sortDirection,
          skip,
          pageSize,
        );

      const result: Pagination<AdminCommentAnswerRawModel[]> =
        this.paginatorService.create(pageNumber, pageSize, count, comments);

      return this.appNotification.success(result);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
