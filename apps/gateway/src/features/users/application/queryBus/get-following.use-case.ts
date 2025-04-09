import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { Pagination, PaginatorService } from '@app/paginator';

import {
  FollowingProfileOutputDtoModel,
  userFollowingProfileInfoMapper,
} from '../../api/dto/output-dto/profile-info-output-dto';
import { SearchQueryParametersWithoutSorting } from '../../../../common/domain/query.types';
import { UsersQueryRepository } from '../../infrastructure/users.query-repository';
import { PhotoServiceAdapter } from '../../../../common/adapter/photo-service.adapter';
import { UsersFollowRepository } from '../../infrastructure/users-follow.repository';

export class GetFollowingQuery {
  constructor(
    public userId: string,
    public currentUserId: string,
    public queryString?: SearchQueryParametersWithoutSorting,
    public cursorUserId?: string,
  ) {}
}

@QueryHandler(GetFollowingQuery)
export class GetFollowingUseCase
  implements
    IQueryHandler<
      GetFollowingQuery,
      AppNotificationResultType<Pagination<FollowingProfileOutputDtoModel[]>>
    >
{
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly paginatorService: PaginatorService,
    private readonly usersFollowRepository: UsersFollowRepository,
  ) {
    this.logger.setContext(GetFollowingUseCase.name);
  }

  async execute(
    command: GetFollowingQuery,
  ): Promise<
    AppNotificationResultType<Pagination<FollowingProfileOutputDtoModel[]>>
  > {
    const { userId, currentUserId, queryString, cursorUserId } = command;
    this.logger.debug(
      `Execute: get following for userId ${userId}`,
      this.execute.name,
    );

    try {
      const { users, count } = await this.usersQueryRepository.getFollowing(
        userId,
        queryString,
        cursorUserId,
      );

      const avatars = await this.photoServiceAdapter.getUsersAvatar(
        users.map((user) => user.id),
      );

      const usersWithFollowStatuses = await Promise.all(
        users.map(async (user) => {
          const isFollowing = await this.usersFollowRepository.isFollowing(
            currentUserId,
            user.id,
          );
          const isFollowedBy = await this.usersFollowRepository.isFollowedBy(
            currentUserId,
            user.id,
          );
          return { user, isFollowing, isFollowedBy };
        }),
      );

      const mappedUsers = usersWithFollowStatuses.map(
        ({ user, isFollowing, isFollowedBy }) => {
          const avatar = avatars
            ? avatars.find((ava) => user.id === ava.ownerId)
            : null;
          return userFollowingProfileInfoMapper(
            user,
            isFollowing,
            isFollowedBy,
            avatar,
          );
        },
      );

      const result: Pagination<FollowingProfileOutputDtoModel[]> =
        this.paginatorService.create(
          queryString.pageNumber,
          queryString.pageSize,
          count,
          mappedUsers,
        );

      return this.appNotification.success(result);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
