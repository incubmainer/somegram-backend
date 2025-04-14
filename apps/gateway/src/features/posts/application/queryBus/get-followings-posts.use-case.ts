import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { Pagination, PaginatorService } from '@app/paginator';
import { LoggerService } from '@app/logger';

import { UsersQueryRepository } from '../../../users/infrastructure/users.query-repository';
import {
  PostOutputDto,
  PostRawOutputModelMapper,
} from '../../api/dto/output-dto/post.output-dto';
import { PostsQueryRepository } from '../../infrastructure/posts.query-repository';
import { PhotoServiceAdapter } from '../../../../common/adapter/photo-service.adapter';
import { SearchQueryParameters } from '../../../../common/domain/query.types';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../../settings/configuration/configuration';

export class GetFollowingsPostsQuery {
  constructor(
    public currentUserId: string,
    public queryString?: SearchQueryParameters,
    public endCursorPostId?: string,
  ) {}
}

@QueryHandler(GetFollowingsPostsQuery)
export class GetFollowingsPostsUseCase
  implements
    IQueryHandler<
      GetFollowingsPostsQuery,
      AppNotificationResultType<Pagination<PostOutputDto[]>>
    >
{
  private readonly frontUrl: string;
  constructor(
    private readonly logger: LoggerService,
    private readonly paginatorService: PaginatorService,
    private readonly appNotification: ApplicationNotification,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
    private readonly postRawOutputModelMapper: PostRawOutputModelMapper,
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {
    this.logger.setContext(GetFollowingsPostsUseCase.name);
    const frontProvider = this.configService.get('envSettings', {
      infer: true,
    }).FRONTED_PROVIDER;
    this.frontUrl = `${frontProvider}/public-user/profile`;
  }
  async execute(
    query: GetFollowingsPostsQuery,
  ): Promise<AppNotificationResultType<Pagination<PostOutputDto[]>>> {
    this.logger.debug('Execute: get followings posts query', this.execute.name);
    const { currentUserId, queryString, endCursorPostId } = query;

    try {
      const followingUsersInfo =
        await this.usersQueryRepository.getFollowingToInfo(currentUserId);

      const followingsIds = followingUsersInfo.map((f) => f.id);

      const { posts, count } =
        await this.postsQueryRepository.getPostsByUserIds(
          currentUserId,
          followingsIds,
          queryString,
          endCursorPostId,
        );

      if (posts.length <= 0)
        return this.appNotification.success(
          this.paginatorService.create(
            queryString.pageNumber,
            queryString.pageSize,
            count,
            [],
          ),
        );

      const promises = posts.map(async (post) => {
        post.lastLikeUser = [];

        post.postImages = await this.photoServiceAdapter.getPostPhotos(post.id);

        const avatar = await this.photoServiceAdapter.getAvatar(post.userId);
        post.ownerAvatarUrl = avatar?.url || null;

        const promisesAvatar = post.lastLikedUserIds.map(async (userId) => {
          const userAvatar = await this.photoServiceAdapter.getAvatar(userId);

          post.lastLikeUser.push({
            userId,
            avatarUrl: userAvatar?.url || null,
            profileUrl: `${this.frontUrl}/${userId}`,
          });
        });

        await Promise.all(promisesAvatar);
      });

      await Promise.all(promises);

      const result: Pagination<PostOutputDto[]> = this.paginatorService.create(
        queryString.pageNumber,
        queryString.pageSize,
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
