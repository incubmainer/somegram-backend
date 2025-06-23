import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';

import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { MessengerServiceAdapter } from '../../../../common/adapter/messenger-service.adapter';
import { PhotoServiceAdapter } from '../../../../common/adapter/photo-service.adapter';

export class RemoveMessagesCommand implements ICommand {
  constructor(
    public currentUserId: string,
    public messagesIds: string[],
  ) {}
}

@CommandHandler(RemoveMessagesCommand)
export class RemoveMessagesUseCase
  implements
    ICommandHandler<RemoveMessagesCommand, AppNotificationResultType<null>>
{
  constructor(
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly usersRepository: UsersRepository,
    private readonly messengerServiceAdapter: MessengerServiceAdapter,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
  ) {
    this.logger.setContext(RemoveMessagesUseCase.name);
  }

  async execute(
    command: RemoveMessagesCommand,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug(
      'Execute: remove messages by ids command',
      this.execute.name,
    );
    const { currentUserId, messagesIds } = command;
    try {
      const participant = await this.usersRepository.getUserById(currentUserId);

      if (!participant) return this.appNotification.notFound();

      const result = await this.messengerServiceAdapter.removeMessagesByIds(
        messagesIds,
        currentUserId,
      );

      if (result.appResult !== AppNotificationResultEnum.Success) return result;

      await this.photoServiceAdapter.deleteMessagesByIds(messagesIds);

      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
