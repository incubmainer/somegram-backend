import { Injectable } from '@nestjs/common';
import { Chat } from '@prisma/messenger';

export class ChatOutputDto {
  id: string;
  createdAt: Date;
}

@Injectable()
export class ChatOutputDtoMapper {
  mapChat(chat: Chat): ChatOutputDto {
    return {
      id: chat.id,
      createdAt: chat.createdAt,
    };
  }
}
