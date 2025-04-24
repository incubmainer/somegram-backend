import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { MessageRepository } from '../../infrastructure/message.repository';
import { CreateMessageReadDto } from '../../domain/types';
import { ReadMessageInputDto } from '../../api/dto/input-dto/read-message.input.dto';

export class ReadMessageCommand implements ICommand {
  constructor(public inputDto: ReadMessageInputDto) {}
}

@CommandHandler(ReadMessageCommand)
export class ReadMessageUseCase
  implements
    ICommandHandler<ReadMessageCommand, AppNotificationResultType<null>>
{
  constructor(
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly messageRepository: MessageRepository,
  ) {
    this.logger.setContext(ReadMessageUseCase.name);
  }

  async execute(
    command: ReadMessageCommand,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug('Execute: read message command', this.execute.name);
    const { messageId, userId } = command.inputDto;
    try {
      const message =
        await this.messageRepository.getMessageByIdWithReadStatus(messageId);

      if (!message) return this.appNotification.notFound();
      if (message.userId !== userId) return this.appNotification.forbidden();

      const isReadByUser = message.MessageReadStatus.some(
        (u) => u.userId === userId,
      );

      if (isReadByUser) return this.appNotification.success(null);

      const readCreateDto: CreateMessageReadDto = {
        messageId,
        createdAt: new Date(),
        userId,
      };

      await this.messageRepository.createMessageReadStatus(readCreateDto);

      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
