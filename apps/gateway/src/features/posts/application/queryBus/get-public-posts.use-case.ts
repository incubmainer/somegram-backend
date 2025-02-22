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
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { Pagination, PaginatorService } from '@app/paginator';

export class GetPublicPostsByUserQuery {
  constructor(
    public queryString?: SearchQueryParametersType,
    public endCursorPostId?: string,
  ) {}
}

@QueryHandler(GetPublicPostsByUserQuery)
export class GetPublicPostsByUserUseCase
  implements
    IQueryHandler<
      GetPublicPostsByUserQuery,
      AppNotificationResultType<Pagination<PostOutputDto[]>>
    >
{
  constructor(
    private readonly logger: LoggerService,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
    private readonly appNotification: ApplicationNotification,
    private readonly paginatorService: PaginatorService,
  ) {
    this.logger.setContext(GetPublicPostsByUserUseCase.name);
  }
  async execute(
    command: GetPublicPostsByUserQuery,
  ): Promise<AppNotificationResultType<Pagination<PostOutputDto[]>>> {
    this.logger.debug('Execute: get public posts command', this.execute.name);
    const { queryString, endCursorPostId } = command;

    const sanitizationQuery = getSanitizationQuery(queryString);
    try {
      const { posts, count } = await this.postsQueryRepository.getAllPosts(
        queryString,
        endCursorPostId,
      );

      const mappedPosts: PostOutputDto[] = await Promise.all(
        posts.map(async (post): Promise<PostOutputDto> => {
          const user = await this.usersQueryRepository.findUserById(
            post.userId,
          );
          const avatarUrl: string = await this.photoServiceAdapter.getAvatar(
            post.userId,
          );
          const postPhotos = await this.photoServiceAdapter.getPostPhotos(
            post.id,
          );
          return postToOutputMapper(post, user, avatarUrl, postPhotos);
        }),
      );

      const result: Pagination<PostOutputDto[]> = this.paginatorService.create(
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
