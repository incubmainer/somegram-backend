import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../../../infrastructure/users.query-repository';
import { User } from '@prisma/gateway';
import { PhotoServiceAdapter } from '../../../../../common/adapter/photo-service.adapter';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import {
  ProfileInfoOutputDto,
  userProfileInfoMapper,
} from '../../../api/dto/output-dto/profile-info-output-dto';

export class GetProfileInfoQuery {
  constructor(public userId: string) {}
}

@QueryHandler(GetProfileInfoQuery)
export class GetProfileInfoUseCase
  implements
    IQueryHandler<
      GetProfileInfoQuery,
      AppNotificationResultType<ProfileInfoOutputDto>
    >
{
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
  ) {
    this.logger.setContext(GetProfileInfoUseCase.name);
  }
  async execute(
    command: GetProfileInfoQuery,
  ): Promise<AppNotificationResultType<ProfileInfoOutputDto>> {
    try {
      const user: User | null = await this.usersQueryRepository.getProfileInfo(
        command.userId,
      );
      if (!user) return this.appNotification.notFound();

      const avatar = await this.photoServiceAdapter.getAvatar(user.id);

      const mapUser: ProfileInfoOutputDto = userProfileInfoMapper(user, avatar);
      return this.appNotification.success(mapUser);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
