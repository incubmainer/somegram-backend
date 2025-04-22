import { Injectable } from '@nestjs/common';
import { ChatRawDto } from '../../../domain/types';

class LastChatMessageOutputDto {
  isMine: boolean;
  content: string;
  createdAt: Date;
}

export class GetAllUserChatsOutputDto {
  id: string;
  participantId: string;
  lastMessage: LastChatMessageOutputDto;

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
      lastMessage: {
        createdAt: chat.lastMessage.createdAt,
        content: chat.lastMessage.content,
        isMine: chat.isMine,
      },
    };
  }

  mapChats(chats: ChatRawDto[]): GetAllUserChatsOutputDto[] {
    return chats.map((c) => this.mapChat(c));
  }
}
