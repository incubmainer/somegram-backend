import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';

import { MessageRepository } from '../../infrastructure/message.repository';
import { SendMessageOutputDto } from '../../api/dto/output-dto/send-message.output.dto';
import { RemoveMessagesInputDto } from '../../api/dto/input-dto/remove-messages.input.dto';

export class RemoveMessagesCommand implements ICommand {
  constructor(public inputDto: RemoveMessagesInputDto) {}
}

@CommandHandler(RemoveMessagesCommand)
export class RemoveMessagesUseCase
  implements
    ICommandHandler<
      RemoveMessagesCommand,
      AppNotificationResultType<SendMessageOutputDto>
    >
{
  constructor(
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly messageRepository: MessageRepository,
  ) {
    this.logger.setContext(RemoveMessagesUseCase.name);
  }

  async execute(
    command: RemoveMessagesCommand,
  ): Promise<AppNotificationResultType<SendMessageOutputDto>> {
    this.logger.debug('Execute: remove messages command', this.execute.name);
    const { messageIds, currentUserId } = command.inputDto;
    try {
      const messages =
        await this.messageRepository.getMessagesByIds(messageIds);

      if (!messages) return this.appNotification.notFound();

      const isUserMessages = messages.find((m) => m.userId !== currentUserId);

      if (isUserMessages) return this.appNotification.forbidden();

      await this.messageRepository.removeMessagesByIds(messageIds);

      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
