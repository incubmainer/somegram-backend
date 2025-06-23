import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Pagination } from '@app/paginator';
import { FileType } from '../../../../../../../../libs/common/enums/file-type.enum';
import { UserAndUserBanInfoType } from '../../../../users/domain/types';
import { ChatMessagesDto, MessageTypeEnum } from '../../../domain/types';

export class ChatMessagesParticipantsOutputDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  readStatus: boolean;

  @ApiProperty()
  readAt: Date | null;

  @ApiProperty()
  avatarUrl: string | null;

  @ApiProperty()
  isBan: boolean;
}

export class ChatMessagesOutputDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  chatId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: ChatMessagesParticipantsOutputDto })
  sender: ChatMessagesParticipantsOutputDto;

  @ApiProperty({ type: ChatMessagesParticipantsOutputDto })
  participant: ChatMessagesParticipantsOutputDto;

  @ApiProperty({ enum: MessageTypeEnum })
  messageType: MessageTypeEnum;

  @ApiProperty()
  duration: number | null;

  @ApiProperty()
  fileUrl: string | null;
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
    message: ChatMessagesDto,
    avatars: FileType[],
    users: UserAndUserBanInfoType[],
  ): ChatMessagesOutputDto {
    const {
      chatId,
      id,
      content,
      messageType,
      duration,
      createdAt,
      sender,
      participant,
      fileUrl,
    } = message;

    const {
      readStatus: senderReadStatus,
      readAt: senderReadAt,
      userId: senderUserId,
    } = sender;

    const {
      readStatus: participantReadStatus,
      readAt: participantReadAt,
      userId: participantUserId,
    } = participant;

    function getUserInfo(userId: string, readAt: Date, readStatus: boolean) {
      const avatarUrl = avatars?.find((a) => a.ownerId === userId)?.url || null;

      const isBan = !!users?.find((u) => u.id === userId).userBanInfo;

      const username =
        users?.find((u) => u.id === userId)?.username || 'unknown';

      return {
        username,
        avatarUrl,
        isBan,
        userId,
        readAt,
        readStatus,
      };
    }

    return {
      id,
      content,
      createdAt,
      chatId,
      messageType,
      duration: duration || null,
      fileUrl: fileUrl || null,
      sender: getUserInfo(senderUserId, senderReadAt, senderReadStatus),
      participant: getUserInfo(
        participantUserId,
        participantReadAt,
        participantReadStatus,
      ),
    };
  }

  mapMessages(
    messages: ChatMessagesDto[],
    avatars: FileType[],
    users: UserAndUserBanInfoType[],
  ): ChatMessagesOutputDto[] {
    return messages.map((m) => this.mapMessage(m, avatars, users));
  }
}
