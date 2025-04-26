import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Pagination } from '@app/paginator';
import { GetChatMessagesOutputDto } from '../../../../../../../messenger/src/features/message/api/dto/output-dto/get-chat-messages.output.dto';
import { FileType } from '../../../../../../../../libs/common/enums/file-type.enum';
import { UserAndUserBanInfoType } from '../../../../users/domain/types';

export class ChatMessagesOutputDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  isMine: boolean;

  @ApiProperty()
  content: string;

  @ApiProperty()
  chatId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  senderId: string;

  @ApiProperty()
  avatarUrl: string | null;

  @ApiProperty()
  isBan: boolean;

  @ApiProperty()
  username: string;

  @ApiProperty()
  myReadStatus: boolean;

  @ApiProperty()
  participantReadStatus: boolean;

  @ApiProperty()
  myReadAt: Date | null;

  @ApiProperty()
  participantReadAt: Date | null;
}

export class ChatMessagesOutputPaginationDto extends Pagination<ChatMessagesOutputDto> {
  @ApiProperty({
    type: ChatMessagesOutputDto,
    isArray: true,
  })
  items: ChatMessagesOutputDto;
}

@Injectable()
export class ChatMessagesOutputDtoMapper {
  mapMessage(
    message: GetChatMessagesOutputDto,
    avatars: FileType[],
    users: UserAndUserBanInfoType[],
  ): ChatMessagesOutputDto {
    const avatar =
      avatars.find((a) => a.ownerId === message.senderId)?.url || null;

    const isBan = !!users.find((u) => u.id === message.senderId).userBanInfo;

    const username =
      users.find((u) => u.id == message.senderId)?.username || 'unknown';

    return {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      chatId: message.chatId,
      isMine: message.isMine,
      senderId: message.senderId,
      avatarUrl: isBan ? null : avatar,
      username,
      isBan,
      myReadStatus: message.myReadStatus,
      myReadAt: message.myReadAt,
      participantReadStatus: message.participantReadStatus,
      participantReadAt: message.participantReadAt,
    };
  }

  mapMessages(
    messages: GetChatMessagesOutputDto[],
    avatars: FileType[],
    users: UserAndUserBanInfoType[],
  ): ChatMessagesOutputDto[] {
    return messages.map((m) => this.mapMessage(m, avatars, users));
  }
}
