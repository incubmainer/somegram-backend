import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../../infrastructure/users.query-repository';
import { PhotoServiceAdapter } from '../../../../common/adapter/photo-service.adapter';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import {
  ProfilePublicInfoOutputDtoModel,
  userPublicProfileInfoMapper,
} from '../../api/dto/output-dto/profile-info-output-dto';

export class GetPublicProfileInfoQuery {
  constructor(public userId: string) {}
}

@QueryHandler(GetPublicProfileInfoQuery)
export class GetPublicProfileInfoUseCase
  implements
    IQueryHandler<
      GetPublicProfileInfoQuery,
      AppNotificationResultType<ProfilePublicInfoOutputDtoModel>
    >
{
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
  ) {
    this.logger.setContext(GetPublicProfileInfoUseCase.name);
  }
  async execute(
    command: GetPublicProfileInfoQuery,
  ): Promise<AppNotificationResultType<ProfilePublicInfoOutputDtoModel>> {
    this.logger.debug(
      'Execute: get public user profile info command',
      this.execute.name,
    );
    const { userId } = command;
    try {
      const user = await this.usersQueryRepository.findUserById(userId);
      if (!user) return this.appNotification.notFound();

      const avatarUrl = await this.photoServiceAdapter.getAvatar(user.id);

      return this.appNotification.success(
        userPublicProfileInfoMapper(user, avatarUrl),
      );
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
