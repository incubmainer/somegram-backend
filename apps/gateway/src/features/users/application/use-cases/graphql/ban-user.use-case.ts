import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';

import { UsersGraphqlRepository } from '../../../infrastructure/users.graphql-repository';
import { BanUserInput } from '../../../../resolvers/users/models/ban-user-input';

export class BanUserCommand {
  constructor(public banUserInput: BanUserInput) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase
  implements ICommandHandler<BanUserCommand, AppNotificationResultType<null>>
{
  constructor(
    private readonly usersGraphqlRepository: UsersGraphqlRepository,
    private readonly appNotification: ApplicationNotification,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(BanUserUseCase.name);
  }

  public async execute(
    command: BanUserCommand,
  ): Promise<AppNotificationResultType<null>> {
    const { userId, banReason } = command.banUserInput;
    try {
      const user = await this.usersGraphqlRepository.findUserById(userId);
      if (!user) {
        return this.appNotification.notFound();
      }

      if (user.userBanInfo) {
        return this.appNotification.success(null);
      }
      await this.usersGraphqlRepository.banUser(userId, banReason);
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
