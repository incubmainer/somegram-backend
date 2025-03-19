import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query-repository';
import {
  PostOutputDto,
  postToOutputMapper,
} from '../../api/dto/output-dto/post.output-dto';
import { PostsQueryRepository } from '../../infrastructure/posts.query-repository';
import { PhotoServiceAdapter } from '../../../../common/adapter/photo-service.adapter';
import { LoggerService } from '@app/logger';
import { SearchQueryParametersType } from '../../../../common/domain/query.types';
import { getSanitizationQuery } from '../../../../common/utils/query-params.sanitizator';
import { Pagination, PaginatorService } from '@app/paginator';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';

export class GetPostsByUserQuery {
  constructor(
    public userId: string,
    public queryString?: SearchQueryParametersType,
    public endCursorPostId?: string,
  ) {}
}

@QueryHandler(GetPostsByUserQuery)
export class GetPostsByUserUseCase
  implements
    IQueryHandler<
      GetPostsByUserQuery,
      AppNotificationResultType<Pagination<PostOutputDto[]>>
    >
{
  constructor(
    private readonly logger: LoggerService,
    private readonly paginatorService: PaginatorService,
    private readonly appNotification: ApplicationNotification,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
  ) {
    this.logger.setContext(GetPostsByUserUseCase.name);
  }
  async execute(
    command: GetPostsByUserQuery,
  ): Promise<AppNotificationResultType<Pagination<PostOutputDto[]>>> {
    this.logger.debug('Execute: get user posts command', this.execute.name);
    const { userId, queryString, endCursorPostId } = command;

    try {
      const user = await this.usersQueryRepository.findUserById(userId);
      if (!user) return this.appNotification.notFound();
      const sanitizationQuery = getSanitizationQuery(queryString);

      const avatarUrl = await this.photoServiceAdapter.getAvatar(userId);

      const { posts, count } = await this.postsQueryRepository.getPostsByUser(
        user.id,
        queryString,
        endCursorPostId,
      );

      const mappedPosts: PostOutputDto[] = await Promise.all(
        posts.map(async (post): Promise<PostOutputDto> => {
          return postToOutputMapper(
            post,
            user,
            avatarUrl,
            await this.photoServiceAdapter.getPostPhotos(post.id),
          );
        }),
      );

      const result: Pagination<PostOutputDto[]> = this.paginatorService.create(
        sanitizationQuery.pageNumber,
        sanitizationQuery.pageSize,
        count,
        mappedPosts,
      );

      return this.appNotification.success(result);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
