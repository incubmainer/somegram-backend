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
  postToOutputMapper,
} from '../../api/dto/output-dto/post.output-dto';
import { PostsQueryRepository } from '../../infrastructure/posts.query-repository';
import { PhotoServiceAdapter } from '../../../../common/adapter/photo-service.adapter';
import { SearchQueryParameters } from '../../../../common/domain/query.types';

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
  constructor(
    private readonly logger: LoggerService,
    private readonly paginatorService: PaginatorService,
    private readonly appNotification: ApplicationNotification,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
  ) {
    this.logger.setContext(GetFollowingsPostsUseCase.name);
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

      const usersAvatar =
        await this.photoServiceAdapter.getUsersAvatar(followingsIds);

      const { posts, count } =
        await this.postsQueryRepository.getPostsByUserIds(
          followingsIds,
          queryString,
          endCursorPostId,
        );

      const mappedPosts: PostOutputDto[] = await Promise.all(
        posts.map(async (post): Promise<PostOutputDto> => {
          return postToOutputMapper(
            post,
            followingUsersInfo.find((user) => user.id === post.userId),
            usersAvatar.find((ava) => ava.ownerId === post.userId),
            await this.photoServiceAdapter.getPostPhotos(post.id),
          );
        }),
      );

      const result: Pagination<PostOutputDto[]> = this.paginatorService.create(
        queryString.pageNumber,
        queryString.pageSize,
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
