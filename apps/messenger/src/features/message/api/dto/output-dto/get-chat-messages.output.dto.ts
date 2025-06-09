import { Injectable } from '@nestjs/common';
import {
  MessageTypeEnum,
  MessageWithReadStatusType,
} from '../../../domain/types';

export class GetChatMessagesOutputDto {
  id: string;
  content: string;
  createdAt: Date;
  senderId: string;
  chatId: string;
  isMine: boolean;
  myReadStatus: boolean;
  myReadAt: Date | null;
  participantReadStatus: boolean;
  participantReadAt: Date | null;
  messageType: MessageTypeEnum;
}

@Injectable()
export class GetChatMessagesOutputDtoMapper {
  mapMessage(
    message: MessageWithReadStatusType,
    currentUserId: string,
  ): GetChatMessagesOutputDto {
    const myStatus = message.MessageReadStatus.find(
      (m) => m.userId === currentUserId,
    );
    const participantStatus = message.MessageReadStatus.find(
      (m) => m.userId !== currentUserId,
    );

    return {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      senderId: message.userId,
      chatId: message.chatId,
      isMine: message.userId === currentUserId,
      myReadStatus: Boolean(myStatus),
      participantReadStatus: Boolean(participantStatus),
      myReadAt: myStatus?.createdAt ?? null,
      participantReadAt: participantStatus?.createdAt ?? null,
      messageType: message.messageType as MessageTypeEnum,
    };
  }

  mapMessages(
    messages: MessageWithReadStatusType[],
    currentUserId: string,
  ): GetChatMessagesOutputDto[] {
    return messages.map((m) => this.mapMessage(m, currentUserId));
  }
}
