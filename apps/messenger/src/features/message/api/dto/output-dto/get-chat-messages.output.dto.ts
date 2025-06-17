import { Injectable } from '@nestjs/common';
import {
  MessageTypeEnum,
  MessageWithReadStatusAndParticipantsType,
} from '../../../domain/types';

export class GetChatMessagesParticipantsOutputDto {
  userId: string;
  readStatus: boolean;
  readAt: Date | null;
}

export class GetChatMessagesOutputDto {
  id: string;
  content: string;
  createdAt: Date;
  chatId: string;
  messageType: MessageTypeEnum;
  sender: GetChatMessagesParticipantsOutputDto;
  participant: GetChatMessagesParticipantsOutputDto;
}

@Injectable()
export class GetChatMessagesOutputDtoMapper {
  mapMessage(
    message: MessageWithReadStatusAndParticipantsType,
  ): GetChatMessagesOutputDto {
    const { id, chatId, userId, messageType, createdAt, content, Chat } =
      message;

    const senderStatus = message.MessageReadStatus.find(
      (m) => m.userId === userId,
    );
    const participantStatus =
      message.MessageReadStatus?.find((m) => m.userId !== userId) || null;

    return {
      id,
      content,
      createdAt,
      chatId,
      messageType: messageType as MessageTypeEnum,
      sender: {
        userId: senderStatus.userId,
        readAt: senderStatus?.createdAt ?? null,
        readStatus: Boolean(senderStatus),
      },
      participant: {
        userId:
          participantStatus?.userId ??
          Chat.Participants.find((i) => i.userId !== senderStatus.userId)
            .userId,
        readAt: participantStatus?.createdAt ?? null,
        readStatus: Boolean(participantStatus),
      },
    };
  }

  mapMessages(
    messages: MessageWithReadStatusAndParticipantsType[],
  ): GetChatMessagesOutputDto[] {
    return messages.map((m) => this.mapMessage(m));
  }
}
