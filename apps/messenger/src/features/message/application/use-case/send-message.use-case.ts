import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { MessageRepository } from '../../infrastructure/message.repository';
import { ChatRepository } from '../../../chat/infrastructure/chat.repository';
import { CreateChatDto } from '../../../chat/domain/types';
import { CreateNewMessageDto } from '../../domain/types';
import { SendMessageInputDto } from '../../api/dto/input-dto/send-message.input.dto';

export class SendMessageCommand implements ICommand {
  constructor(public inputDto: SendMessageInputDto) {}
}

@CommandHandler(SendMessageCommand)
export class SendMessageUseCase
  implements
    ICommandHandler<SendMessageCommand, AppNotificationResultType<null>>
{
  constructor(
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly messageRepository: MessageRepository,
    private readonly chatRepository: ChatRepository,
  ) {
    this.logger.setContext(SendMessageUseCase.name);
  }

  async execute(
    command: SendMessageCommand,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug('Execute: send message command', this.execute.name);
    const { currentParticipantId, participantId, message } = command.inputDto;
    try {
      const chat = await this.chatRepository.getChatByUserIds(
        currentParticipantId,
        participantId,
      );

      if (!chat) {
        await this.handleNewChat(currentParticipantId, participantId, message);
      } else {
        await this.handleCurrentChat(currentParticipantId, message, chat.id);
      }

      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }

  private async handleNewChat(
    currentParticipantId: string,
    participantId: string,
    message: string,
  ): Promise<void> {
    const data: CreateChatDto = {
      message,
      currentParticipantId,
      participantId,
      createdAt: new Date(),
    };

    await this.chatRepository.createChatWithParticipants(data);
  }

  private async handleCurrentChat(
    currentParticipantId: string,
    message: string,
    chatId: string,
  ): Promise<void> {
    const data: CreateNewMessageDto = {
      message,
      chatId: chatId,
      senderId: currentParticipantId,
      createdAt: new Date(),
    };

    await this.messageRepository.createMessage(data);
  }
}
