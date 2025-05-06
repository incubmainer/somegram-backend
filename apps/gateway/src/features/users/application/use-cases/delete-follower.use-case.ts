import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';

import { UsersFollowRepository } from '../../infrastructure/users-follow.repository';

export class DeleteFollowerCommand {
  constructor(
    public userId: string,
    public followerId: string,
  ) {}
}

@CommandHandler(DeleteFollowerCommand)
export class DeleteFollowerUseCase
  implements
    ICommandHandler<
      DeleteFollowerCommand,
      AppNotificationResultType<null, string>
    >
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersFollowRepository: UsersFollowRepository,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
  ) {
    this.logger.setContext(DeleteFollowerUseCase.name);
  }

  public async execute(
    command: DeleteFollowerCommand,
  ): Promise<AppNotificationResultType<null, string>> {
    this.logger.debug('Execute: remove follower command', this.execute.name);
    const { userId, followerId } = command;

    if (userId === followerId)
      return this.appNotification.badRequest('User try remove self');

    try {
      const follower = await this.usersRepository.getUserById(followerId);
      if (!follower) return this.appNotification.notFound();

      await this.usersFollowRepository.unfollowToUser(followerId, userId);

      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
