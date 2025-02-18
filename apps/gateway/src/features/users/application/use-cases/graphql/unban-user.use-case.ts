import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';

import { UsersGraphqlRepository } from '../../../infrastructure/users.graphql-repository';

export class UnbanUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(UnbanUserCommand)
export class UnbanUserUseCase
  implements ICommandHandler<UnbanUserCommand, AppNotificationResultType<null>>
{
  constructor(
    private readonly usersGraphqlRepository: UsersGraphqlRepository,
    private readonly appNotification: ApplicationNotification,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UnbanUserUseCase.name);
  }

  public async execute(
    command: UnbanUserCommand,
  ): Promise<AppNotificationResultType<null>> {
    const { userId } = command;
    try {
      const user = await this.usersGraphqlRepository.findUserById(userId);
      if (!user) {
        return this.appNotification.notFound();
      }
      if (!user.UserBanInfo) {
        return this.appNotification.success(null);
      }
      this.usersGraphqlRepository.unbanUser(userId);
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
