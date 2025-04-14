import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';

import { UsersFollowRepository } from '../../infrastructure/users-follow.repository';

export class UnfollowToUserCommand {
  constructor(
    public userId: string,
    public followeeId: string,
  ) {}
}

@CommandHandler(UnfollowToUserCommand)
export class UnfollowToUserUseCase
  implements
    ICommandHandler<
      UnfollowToUserCommand,
      AppNotificationResultType<null, string>
    >
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersFollowRepository: UsersFollowRepository,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
  ) {
    this.logger.setContext(UnfollowToUserUseCase.name);
  }

  public async execute(
    command: UnfollowToUserCommand,
  ): Promise<AppNotificationResultType<null, string>> {
    this.logger.debug('Execute: unfollow user command', this.execute.name);
    const { userId, followeeId } = command;

    if (userId === followeeId)
      return this.appNotification.badRequest('User try unfollow myself');

    try {
      const followee = await this.usersRepository.getUserById(followeeId);
      if (!followee) return this.appNotification.notFound();

      await this.usersFollowRepository.unfollowToUser(userId, followeeId);

      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
