import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { Pagination, PaginatorService } from '@app/paginator';
import { LoggerService } from '@app/logger';
import { PostsCommentQueryRepository } from '../../infrastructure/posts-comment.query-repository';
import { PhotoServiceAdapter } from '../../../../common/adapter/photo-service.adapter';
import {
  CommentAnswersOutputDto,
  CommentAnswersOutputDtoMapper,
} from '../../api/dto/output-dto/comment-answers.output-dto';
import { GetCommentAnswersQueryDto } from '../../api/dto/input-dto/get-comment-answers.query.dto';

export class GetCommentAnswersByCommentIdQuery {
  constructor(
    public commentId: string,
    public userId: string,
    public query: GetCommentAnswersQueryDto,
  ) {}
}

@QueryHandler(GetCommentAnswersByCommentIdQuery)
export class GetCommentAnswersByCommentIdUseCase
  implements
    IQueryHandler<
      GetCommentAnswersByCommentIdQuery,
      AppNotificationResultType<Pagination<CommentAnswersOutputDto[]>>
    >
{
  constructor(
    private readonly logger: LoggerService,
    private readonly paginatorService: PaginatorService,
    private readonly appNotification: ApplicationNotification,
    private readonly postsCommentQueryRepository: PostsCommentQueryRepository,
    private readonly commentAnswersOutputDtoMapper: CommentAnswersOutputDtoMapper,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
  ) {
    this.logger.setContext(GetCommentAnswersByCommentIdUseCase.name);
  }
  async execute(
    command: GetCommentAnswersByCommentIdQuery,
  ): Promise<AppNotificationResultType<Pagination<CommentAnswersOutputDto[]>>> {
    this.logger.debug(
      'Execute: get post comments by post id command',
      this.execute.name,
    );
    const { commentId, userId, query } = command;
    const { pageSize, sortBy, sortDirection, pageNumber } = query;
    try {
      const skip = (pageNumber - 1) * pageSize;

      const comment =
        await this.postsCommentQueryRepository.getCommentById(commentId);

      if (!comment) return this.appNotification.notFound();

      const commentsResult =
        await this.postsCommentQueryRepository.getCommentAnswersByCommentId(
          commentId,
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

      const result: Pagination<CommentAnswersOutputDto[]> =
        this.paginatorService.create(
          pageNumber,
          pageSize,
          count,
          comments && comments.length > 0
            ? this.commentAnswersOutputDtoMapper.mapAnswers(comments)
            : [],
        );

      return this.appNotification.success(result);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
