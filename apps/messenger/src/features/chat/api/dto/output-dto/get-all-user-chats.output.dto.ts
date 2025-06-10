import { Injectable } from '@nestjs/common';
import { ChatRawDto } from '../../../domain/types';

class LastChatMessageOutputDto {
  id: string;
  isMine: boolean;
  content: string;
  createdAt: Date;
  myReadStatus: boolean;
}

export class GetAllUserChatsOutputDto {
  id: string;
  participantId: string;
  lastMessage: LastChatMessageOutputDto | null;

  avatarUrl?: string | null;
  isBan?: boolean;
  username?: string;
}

@Injectable()
export class UserChatOutputDtoMapper {
  mapChat(chat: ChatRawDto): GetAllUserChatsOutputDto {
    return {
      id: chat.id,
      participantId: chat.participantId,
      lastMessage: chat.lastMessage
        ? {
            id: chat.lastMessage.id,
            createdAt: chat.lastMessage.createdAt,
            content: chat.lastMessage.content,
            isMine: chat.isMine,
            myReadStatus: chat.isMyRead,
          }
        : null,
    };
  }

  mapChats(chats: ChatRawDto[]): GetAllUserChatsOutputDto[] {
    return chats.map((c) => this.mapChat(c));
  }
}
