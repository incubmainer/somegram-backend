import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { WS_MESSAGE_READ_EVENT } from '../../../../common/constants/ws-events.constants';
import {
  MessengerWsGateway,
  WS_CHAT_ROOM_NAME,
} from '../../api/messenger.ws-gateway';
import { ChatMessagesDto, MessageTypeEnum } from '../../domain/types';
import { PhotoServiceAdapter } from '../../../../common/adapter/photo-service.adapter';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query-repository';
import { ChatMessagesOutputDtoMapper } from '../../api/dto/output-dto/get-chat-messages.output.dto';

export class MessageReadEvent {
  constructor(public message: ChatMessagesDto) {}
}

@EventsHandler(MessageReadEvent)
export class MessageReadEventHandler
  implements IEventHandler<MessageReadEvent>
{
  constructor(
    private readonly logger: LoggerService,
    private readonly messengerWsGateway: MessengerWsGateway,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly chatMessagesOutputDtoMapper: ChatMessagesOutputDtoMapper,
  ) {
    this.logger.setContext(MessageReadEventHandler.name);
  }
  async handle(event: MessageReadEvent): Promise<void> {
    this.logger.debug('Publish message read notification', this.handle.name);
    const { message } = event;

    const { messageType } = message;

    let handledMessage = message;
    if (messageType === MessageTypeEnum.VOICE) {
      const voiceMessage = await this.getVoiceInfo(message);

      if (!voiceMessage) return;

      handledMessage = voiceMessage;
    }

    const userIds = [message.sender.userId, message.participant.userId];

    const avatars = await this.photoServiceAdapter.getUsersAvatar(userIds);
    const usersInfo =
      await this.usersQueryRepository.getUsersAndUsersIsBan(userIds);

    const mappedMessage = this.chatMessagesOutputDtoMapper.mapMessage(
      handledMessage,
      avatars,
      usersInfo,
    );
    try {
      this.messengerWsGateway.emitToRoom(
        WS_CHAT_ROOM_NAME,
        message.chatId,
        WS_MESSAGE_READ_EVENT,
        mappedMessage,
      );
      this.logger.debug('Success', this.handle.name);
    } catch (e) {
      this.logger.error(e, this.handle.name);
    }
  }

  private async getVoiceInfo(
    message: ChatMessagesDto,
    maxRetries = 5,
    delayMs = 2000,
  ): Promise<ChatMessagesDto | null> {
    const { id } = message;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const voiceMessage =
        await this.photoServiceAdapter.getVoiceMessageById(id);

      if (voiceMessage) {
        message.content = voiceMessage.url;
        message.duration = voiceMessage.duration;
        return message;
      }

      this.logger.warn(
        `Voice message not available yet (attempt ${attempt}/${maxRetries})`,
        this.getVoiceInfo.name,
      );

      if (attempt < maxRetries) {
        await new Promise((res) => setTimeout(res, delayMs));
      }
    }

    this.logger.warn(
      `Voice message not found after ${maxRetries} attempts`,
      this.getVoiceInfo.name,
    );
    return null;
  }
}
