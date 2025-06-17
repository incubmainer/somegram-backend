import { Injectable } from '@nestjs/common';
import { PhotoServiceAdapter } from '../../../common/adapter/photo-service.adapter';
import { UsersQueryRepository } from '../../users/infrastructure/users.query-repository';
import {
  ChatMessagesOutputDto,
  ChatMessagesOutputDtoMapper,
} from '../api/dto/output-dto/get-chat-messages.output.dto';
import { ChatMessagesDto, MessageTypeEnum } from '../domain/types';
import { LoggerService } from '@app/logger';

@Injectable()
export class MessengerService {
  constructor(
    private readonly photoServiceAdapter: PhotoServiceAdapter,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly chatMessagesOutputDtoMapper: ChatMessagesOutputDtoMapper,
    private readonly logger: LoggerService,
  ) {}

  async handleMessage(
    message: ChatMessagesDto,
  ): Promise<ChatMessagesOutputDto> {
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

    return this.chatMessagesOutputDtoMapper.mapMessage(
      handledMessage,
      avatars,
      usersInfo,
    );
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
