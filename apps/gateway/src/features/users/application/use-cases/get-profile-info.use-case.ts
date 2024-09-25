import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '../../../../../../../libs/custom-logger/src';
import { Notification } from '../../../../common/domain/notification';
import { ProfileInfoOutputDto } from '../../api/dto/output-dto/profile-info-output-dto';
import { UsersQueryRepository } from '../../infrastructure/users.query-repository';
import { AvatarStorageService } from '../../infrastructure/avatar-storage.service';
import { AvatarRepository } from '../../infrastructure/avatar.repository';

export const ProfileInfoCodes = {
  Success: Symbol('success'),
  UserNotFound: Symbol('userNotFound'),
  TransactionError: Symbol('transactionError'),
};
export class GetProfileInfoCommand {
  constructor(public userId: string) {}
}

@CommandHandler(GetProfileInfoCommand)
@LogClass({
  level: 'trace',
  loggerClassField: 'logger',
  active: () => process.env.NODE_ENV !== 'production',
})
export class GetProfileInfoUseCase
  implements ICommandHandler<GetProfileInfoCommand>
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
    command: GetProfileInfoCommand,
  ): Promise<Notification<ProfileInfoOutputDto>> {
    const notification = new Notification<ProfileInfoOutputDto>(
      ProfileInfoCodes.Success,
    );
    try {
      const userProfile = await this.usersQueryRepository.getProfileInfo(
        command.userId,
      );
      if (!userProfile) {
        notification.setCode(ProfileInfoCodes.UserNotFound);
        return notification;
      }
      userProfile.addAvatar(null);
      const avatarKey = await this.avatarRepository.getAvatarKeyByUserId(
        command.userId,
      );
      if (avatarKey) {
        const avatarUrl =
          await this.avatarStorageService.getAvatarUrl(avatarKey);
        userProfile.addAvatar(avatarUrl);
      }
      notification.setData(userProfile);
    } catch (e) {
      this.logger.log('error', 'transaction error', { e });
      notification.setCode(ProfileInfoCodes.TransactionError);
    }
    return notification;
  }
}
