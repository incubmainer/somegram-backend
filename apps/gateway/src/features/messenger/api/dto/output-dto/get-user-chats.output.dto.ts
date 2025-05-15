import { Injectable } from '@nestjs/common';

import { ApiProperty } from '@nestjs/swagger';
import { Pagination } from '@app/paginator';
import { AllUserChatsDto } from '../../../domain/types';

class LastChatMessageOutputDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  isMine: boolean;

  @ApiProperty()
  content: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  myReadStatus: boolean;
}

class ParticipantOutputDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  avatarUrl: string | null;

  @ApiProperty()
  isBan: boolean;

  @ApiProperty()
  username: string;
}

export class GetUserChatsOutputDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  participant: ParticipantOutputDto;

  @ApiProperty({ type: LastChatMessageOutputDto })
  lastMessage: LastChatMessageOutputDto;
}

export class GetUserChatsOutputPaginationDto extends Pagination<GetUserChatsOutputDto> {
  @ApiProperty({
    type: GetUserChatsOutputDto,
    isArray: true,
  })
  items: GetUserChatsOutputDto;
}

@Injectable()
export class GetUserChatsOutputDtoMapper {
  mapChat(chat: AllUserChatsDto): GetUserChatsOutputDto {
    return {
      id: chat.id,
      participant: {
        id: chat.participantId,
        avatarUrl: chat.avatarUrl || null,
        isBan: chat.isBan || false,
        username: chat.username || 'unknown',
      },
      lastMessage: chat.lastMessage,
    };
  }

  mapChats(chats: AllUserChatsDto[]): GetUserChatsOutputDto[] {
    return chats.map((chat) => this.mapChat(chat));
  }
}
