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
import { ChatRepository } from '../../../chat/infrastructure/chat.repository';
import { CreateChatDto } from '../../../chat/domain/types';
import { CreateNewMessageDto } from '../../domain/types';
import { SendMessageInputDto } from '../../api/dto/input-dto/send-message.input.dto';
import { MessageEntity } from '../../domain/message.entity';
import { ChatEntity } from '../../../chat/domain/chat.entity';

export class SendMessageCommand implements ICommand {
  constructor(public inputDto: SendMessageInputDto) {}
}

@CommandHandler(SendMessageCommand)
export class SendMessageUseCase
  implements
    ICommandHandler<SendMessageCommand, AppNotificationResultType<string>>
{
  constructor(
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly messageRepository: MessageRepository,
    private readonly chatRepository: ChatRepository,
    private readonly publisher: EventPublisher,
  ) {
    this.logger.setContext(SendMessageUseCase.name);
  }

  async execute(
    command: SendMessageCommand,
  ): Promise<AppNotificationResultType<string>> {
    this.logger.debug('Execute: send message command', this.execute.name);
    const { currentParticipantId, participantId, message } = command.inputDto;
    try {
      const chat = await this.chatRepository.getChatByUserIds(
        currentParticipantId,
        participantId,
      );

      let newMessage: MessageEntity;
      let result;
      if (!chat) {
        result = await this.handleNewChat(
          currentParticipantId,
          participantId,
          message,
        );
        newMessage = result.message;
      } else {
        newMessage = await this.handleCurrentChat(
          currentParticipantId,
          message,
          chat.id,
        );
      }

      this.publish(newMessage, participantId);

      return this.appNotification.success(result ? result.chat.id : chat.id);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }

  private async handleNewChat(
    currentParticipantId: string,
    participantId: string,
    message: string,
  ): Promise<{ chat: ChatEntity; message: MessageEntity }> {
    const data: CreateChatDto = {
      message,
      currentParticipantId,
      participantId,
      createdAt: new Date(),
    };

    return await this.chatRepository.createChatWithParticipants(data);
  }

  private async handleCurrentChat(
    currentParticipantId: string,
    message: string,
    chatId: string,
  ): Promise<MessageEntity> {
    const data: CreateNewMessageDto = {
      message,
      chatId: chatId,
      senderId: currentParticipantId,
      createdAt: new Date(),
    };

    return await this.messageRepository.createMessage(data);
  }

  private publish(message: MessageEntity, participantId: string): void {
    const messageWithEvent = this.publisher.mergeObjectContext(message);

    messageWithEvent.newMessageEvent(participantId);
    messageWithEvent.readMessageEvent(participantId);
    messageWithEvent.commit();
  }
}
