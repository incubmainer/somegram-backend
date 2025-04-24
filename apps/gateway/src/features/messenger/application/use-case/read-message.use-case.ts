import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { ReadMessageDto } from '../../domain/types';
import { MessengerServiceAdapter } from '../../../../common/adapter/messenger-service.adapter';

export class ReadMessageCommand implements ICommand {
  constructor(
    public userId: string,
    public messageId: string,
  ) {}
}

@CommandHandler(ReadMessageCommand)
export class ReadMessageUseCase
  implements
    ICommandHandler<ReadMessageCommand, AppNotificationResultType<null>>
{
  constructor(
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly usersRepository: UsersRepository,
    private readonly messengerServiceAdapter: MessengerServiceAdapter,
  ) {
    this.logger.setContext(ReadMessageUseCase.name);
  }

  async execute(
    command: ReadMessageCommand,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug('Execute: read message command', this.execute.name);
    const { userId, messageId } = command;
    try {
      const data: ReadMessageDto = {
        userId,
        messageId,
      };

      const result = await this.messengerServiceAdapter.readMessage(data);

      if (result.appResult !== AppNotificationResultEnum.Success) return result;

      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
