import {
  CommandHandler,
  EventPublisher,
  ICommand,
  ICommandHandler,
} from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { MessageRepository } from '../../infrastructure/message.repository';
import { CreateMessageReadDto } from '../../domain/types';
import { ReadMessageInputDto } from '../../api/dto/input-dto/read-message.input.dto';
import { MessageEntity } from '../../domain/message.entity';

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
    private readonly publisher: EventPublisher,
  ) {
    this.logger.setContext(ReadMessageUseCase.name);
  }

  async execute(
    command: ReadMessageCommand,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug('Execute: read message command', this.execute.name);
    const { messageId, userId } = command.inputDto;
    try {
      const messageResult =
        await this.messageRepository.getMessageByIdWithReadStatus(messageId);

      if (!messageResult) return this.appNotification.notFound();
      const { message, messageReadStatus, participants } = messageResult;
      if (!participants.some((p) => p.userId === userId))
        return this.appNotification.forbidden();

      const isReadByUser = messageReadStatus?.some((u) => u.userId === userId);

      if (isReadByUser) return this.appNotification.success(null);

      const secondParticipantId = participants.find(
        (p) => p.userId !== userId,
      ).userId;

      const readCreateDto: CreateMessageReadDto = {
        messageId,
        createdAt: new Date(),
        userId,
      };

      await this.messageRepository.createMessageReadStatus(readCreateDto);

      this.publish(message, secondParticipantId);

      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }

  private publish(message: MessageEntity, participantId: string): void {
    const messageWithEvent = this.publisher.mergeObjectContext(message);

    messageWithEvent.readMessageEvent(participantId);
    messageWithEvent.commit();
  }
}
