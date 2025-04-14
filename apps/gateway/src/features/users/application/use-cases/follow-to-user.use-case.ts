import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';

import { UsersFollowRepository } from '../../infrastructure/users-follow.repository';

export class FollowToUserCommand {
  constructor(
    public userId: string,
    public followeeId: string,
  ) {}
}

@CommandHandler(FollowToUserCommand)
export class FollowToUserUseCase
  implements
    ICommandHandler<
      FollowToUserCommand,
      AppNotificationResultType<null, string>
    >
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersFollowRepository: UsersFollowRepository,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
  ) {
    this.logger.setContext(FollowToUserUseCase.name);
  }

  public async execute(
    command: FollowToUserCommand,
  ): Promise<AppNotificationResultType<null, string>> {
    this.logger.debug(
      'Execute: filling user profile info command',
      this.execute.name,
    );
    const { userId, followeeId } = command;

    if (userId === followeeId)
      return this.appNotification.badRequest('User try follow to myself');
    try {
      const followee = await this.usersRepository.getUserById(followeeId);
      if (!followee) return this.appNotification.notFound();

      await this.usersFollowRepository.followToUser(userId, followeeId);

      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
