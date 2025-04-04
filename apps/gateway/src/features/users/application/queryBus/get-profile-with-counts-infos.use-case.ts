import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';

import {
  ProfileInfoWithFullCountsInfosOutputDtoModel,
  userPublicProfileInfoMapper,
} from '../../api/dto/output-dto/profile-info-output-dto';
import { UsersQueryRepository } from '../../infrastructure/users.query-repository';
import { PhotoServiceAdapter } from '../../../../common/adapter/photo-service.adapter';
import { UsersFollowRepository } from '../../infrastructure/users-follow.repository';

export class GetUserProfileWithCountsInfosQuery {
  constructor(
    public currentUserId: string,
    public userId: string,
  ) {}
}

@QueryHandler(GetUserProfileWithCountsInfosQuery)
export class GetUserProfileWithCountsInfosUseCase
  implements
    IQueryHandler<
      GetUserProfileWithCountsInfosQuery,
      AppNotificationResultType<
        ProfileInfoWithFullCountsInfosOutputDtoModel,
        string
      >
    >
{
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly usersFollowRepository: UsersFollowRepository,
  ) {
    this.logger.setContext(GetUserProfileWithCountsInfosUseCase.name);
  }
  async execute(
    command: GetUserProfileWithCountsInfosQuery,
  ): Promise<
    AppNotificationResultType<
      ProfileInfoWithFullCountsInfosOutputDtoModel,
      string
    >
  > {
    this.logger.debug(
      'Execute: get user profile with posts count and followee/wers counts query',
      this.execute.name,
    );
    const { currentUserId, userId } = command;

    try {
      const [userInfo, isFollowing, isFollowedBy, avatar] = await Promise.all([
        this.usersQueryRepository.findUserWithPostsCounts(userId),
        this.usersFollowRepository.isFollowing(currentUserId, userId),
        this.usersFollowRepository.isFollowedBy(currentUserId, userId),
        await this.photoServiceAdapter.getAvatar(userId),
      ]);
      if (!userInfo) {
        return this.appNotification.notFound();
      }

      const { user, publicationsCount, followersCount, followingCount } =
        userInfo;

      return this.appNotification.success({
        ...userPublicProfileInfoMapper(user, avatar),
        isFollowing,
        isFollowedBy,
        followingCount,
        followersCount,
        publicationsCount,
      });
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
