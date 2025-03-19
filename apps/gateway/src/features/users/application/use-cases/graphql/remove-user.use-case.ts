import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';

import { UsersGraphqlRepository } from '../../../infrastructure/users.graphql-repository';

export class RemoveUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(RemoveUserCommand)
export class RemoveUserUseCase
  implements
    ICommandHandler<RemoveUserCommand, AppNotificationResultType<null>>
{
  constructor(
    private readonly usersGraphqlRepository: UsersGraphqlRepository,
    private readonly appNotification: ApplicationNotification,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(RemoveUserUseCase.name);
  }

  public async execute(
    command: RemoveUserCommand,
  ): Promise<AppNotificationResultType<null>> {
    const { userId } = command;
    try {
      const res = this.usersGraphqlRepository.removeUser(userId);
      if (!res) return this.appNotification.notFound();
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
