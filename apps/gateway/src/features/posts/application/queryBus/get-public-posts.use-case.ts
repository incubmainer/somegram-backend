import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  PostOutputDto,
  PostRawOutputModelMapper,
} from '../../api/dto/output-dto/post.output-dto';
import { PostsQueryRepository } from '../../infrastructure/posts.query-repository';
import { PhotoServiceAdapter } from '../../../../common/adapter/photo-service.adapter';
import { LoggerService } from '@app/logger';
import { SearchQueryParameters } from '../../../../common/domain/query.types';
import { getSanitizationQuery } from '../../../../common/utils/query-params.sanitizator';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { Pagination, PaginatorService } from '@app/paginator';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../../settings/configuration/configuration';

export class GetPublicPostsByUserQuery {
  constructor(
    public userId: string | null,
    public queryString?: SearchQueryParameters,
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
  private readonly frontUrl: string;

  constructor(
    private readonly logger: LoggerService,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
    private readonly appNotification: ApplicationNotification,
    private readonly paginatorService: PaginatorService,
    private readonly postRawOutputModelMapper: PostRawOutputModelMapper,
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {
    this.logger.setContext(GetPublicPostsByUserUseCase.name);
    const frontProvider = this.configService.get('envSettings', {
      infer: true,
    }).FRONTED_PROVIDER;
    this.frontUrl = `${frontProvider}/public-user/profile`;
  }
  async execute(
    command: GetPublicPostsByUserQuery,
  ): Promise<AppNotificationResultType<Pagination<PostOutputDto[]>>> {
    this.logger.debug('Execute: get public posts command', this.execute.name);
    const { queryString, endCursorPostId, userId } = command;

    const sanitizationQuery = getSanitizationQuery(queryString);
    try {
      const { posts, count } = await this.postsQueryRepository.getAllPosts(
        userId,
        queryString,
        endCursorPostId,
      );

      if (posts.length <= 0)
        return this.appNotification.success(
          this.paginatorService.create(
            sanitizationQuery.pageNumber,
            sanitizationQuery.pageSize,
            count,
            [],
          ),
        );

      const promises = posts.map(async (post) => {
        post.lastLikeUser = [];

        post.postImages = await this.photoServiceAdapter.getPostPhotos(post.id);
        const avatarUrl = await this.photoServiceAdapter.getAvatar(userId);
        post.ownerAvatarUrl = avatarUrl?.url || null;

        const promisesAvatar = post.lastLikedUserIds.map(async (i) => {
          const avatar = await this.photoServiceAdapter.getAvatar(i);

          post.lastLikeUser.push({
            userId,
            avatarUrl: avatar?.url || null,
            profileUrl: `${this.frontUrl}/${userId}`,
          });
        });

        await Promise.all(promisesAvatar);
      });

      await Promise.all(promises);

      const result: Pagination<PostOutputDto[]> = this.paginatorService.create(
        sanitizationQuery.pageNumber,
        sanitizationQuery.pageSize,
        count,
        this.postRawOutputModelMapper.mapPosts(posts),
      );

      return this.appNotification.success(result);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
