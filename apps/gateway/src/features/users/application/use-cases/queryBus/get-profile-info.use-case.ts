import {
  LogClass,
  InjectCustomLoggerService,
  CustomLoggerService,
} from '@app/custom-logger';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { UsersQueryRepository } from '../../../infrastructure/users.query-repository';
import { NotificationObject } from '../../../../../common/domain/notification';
import { User } from '@prisma/gateway';
import { PhotoServiceAdapter } from '../../../../../common/adapter/photo-service.adapter';

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
    private readonly photoServiceAdapter: PhotoServiceAdapter,
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
      avatarUrl: string | null;
    }>(ProfileInfoCodes.Success);
    try {
      const user = await this.usersQueryRepository.getProfileInfo(
        command.userId,
      );
      if (!user) {
        notification.setCode(ProfileInfoCodes.UserNotFound);
        return notification;
      }
      const avatarUrl = await this.photoServiceAdapter.getAvatar(user.id);
      notification.setData({ user, avatarUrl });
    } catch (e) {
      this.logger.log('error', 'transaction error', { e });
      notification.setCode(ProfileInfoCodes.TransactionError);
    }
    return notification;
  }
}
