import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import {
  WS_NEW_CHAT_MESSAGE_EVENT,
  WS_NEW_MESSAGE_EVENT,
} from '../../../../common/constants/ws-events.constants';
import {
  MessengerWsGateway,
  WS_CHAT_ROOM_NAME,
} from '../../api/messenger.ws-gateway';
import { ChatMessagesDto, MessageTypeEnum } from '../../domain/types';
import { PhotoServiceAdapter } from '../../../../common/adapter/photo-service.adapter';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query-repository';
import { ChatMessagesOutputDtoMapper } from '../../api/dto/output-dto/get-chat-messages.output.dto';

export class NewMessageEvent {
  constructor(
    public message: ChatMessagesDto,
    public participantId: string,
  ) {}
}

@EventsHandler(NewMessageEvent)
export class NewMessageEventHandler implements IEventHandler<NewMessageEvent> {
  constructor(
    private readonly logger: LoggerService,
    private readonly messengerWsGateway: MessengerWsGateway,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly chatMessagesOutputDtoMapper: ChatMessagesOutputDtoMapper,
  ) {
    this.logger.setContext(NewMessageEventHandler.name);
  }
  async handle(event: NewMessageEvent): Promise<void> {
    this.logger.debug('Publish new message', this.handle.name);
    const { message, participantId } = event;

    const { messageType } = message;

    let handledMessage = message;
    if (messageType === MessageTypeEnum.VOICE) {
      const voiceMessage = await this.getVoiceInfo(message);

      if (!voiceMessage) return;

      handledMessage = voiceMessage;
    }

    const userIds = [message.senderId];

    const avatar = await this.photoServiceAdapter.getUsersAvatar(userIds);
    const senderInfo =
      await this.usersQueryRepository.getUsersAndUsersIsBan(userIds);

    const mappedMessage = this.chatMessagesOutputDtoMapper.mapMessage(
      handledMessage,
      avatar,
      senderInfo,
    );

    try {
      this.messengerWsGateway.emitMessageByUserId(
        participantId,
        WS_NEW_MESSAGE_EVENT,
        mappedMessage,
      );
      this.messengerWsGateway.emitToRoom(
        WS_CHAT_ROOM_NAME,
        message.chatId,
        WS_NEW_CHAT_MESSAGE_EVENT,
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
