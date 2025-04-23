import { Injectable } from '@nestjs/common';
import { Message } from '@prisma/messenger';

export class GetChatMessagesOutputDto {
  id: string;
  content: string;
  createdAt: Date;
  senderId: string;
  isMine: boolean;
}

@Injectable()
export class GetChatMessagesOutputDtoMapper {
  mapMessage(
    message: Message,
    currentUserId: string,
  ): GetChatMessagesOutputDto {
    return {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      senderId: message.userId,
      isMine: message.userId === currentUserId,
    };
  }

  mapMessages(
    messages: Message[],
    currentUserId: string,
  ): GetChatMessagesOutputDto[] {
    return messages.map((m) => this.mapMessage(m, currentUserId));
  }
}
