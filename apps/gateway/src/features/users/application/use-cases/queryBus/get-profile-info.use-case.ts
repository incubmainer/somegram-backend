import {
  LogClass,
  InjectCustomLoggerService,
  CustomLoggerService,
} from '@app/custom-logger';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { AvatarStorageService } from '../../../infrastructure/avatar-storage.service';
import { AvatarRepository } from '../../../infrastructure/avatar.repository';
import { UsersQueryRepository } from '../../../infrastructure/users.query-repository';
import { NotificationObject } from '../../../../../common/domain/notification';
import { User } from '@prisma/gateway';

export const ProfileInfoCodes = {
  Success: Symbol('success'),
  UserNotFound: Symbol('userNotFound'),
  TransactionError: Symbol('transactionError'),
};
export class GetProfileInfoQuery {
  constructor(public userId: string) {}
}

@QueryHandler(GetProfileInfoQuery)
@LogClass({
  level: 'trace',
  loggerClassField: 'logger',
  active: () => process.env.NODE_ENV !== 'production',
})
export class GetProfileInfoUseCase
  implements IQueryHandler<GetProfileInfoQuery>
{
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private readonly avatarStorageService: AvatarStorageService,
    private readonly avatarRepository: AvatarRepository,
    @InjectCustomLoggerService()
    private readonly logger: CustomLoggerService,
  ) {
    logger.setContext(GetProfileInfoUseCase.name);
  }
  async execute(
    command: GetProfileInfoQuery,
  ): Promise<NotificationObject<{ user: User; avatarUrl: string | null }>> {
    const notification = new NotificationObject<{
      user: User;
      avatarUrl: string;
    }>(ProfileInfoCodes.Success);
    try {
      const user = await this.usersQueryRepository.getProfileInfo2(
        command.userId,
      );
      if (!user) {
        notification.setCode(ProfileInfoCodes.UserNotFound);
        return notification;
      }
      const avatarKey = await this.avatarRepository.getAvatarKeyByUserId(
        command.userId,
      );
      let avatarUrl = null;
      if (avatarKey) {
        avatarUrl = this.avatarStorageService.getAvatarUrl(avatarKey);
      }
      notification.setData({ user, avatarUrl });
    } catch (e) {
      this.logger.log('error', 'transaction error', { e });
      notification.setCode(ProfileInfoCodes.TransactionError);
    }
    return notification;
  }
}
