import { Injectable } from '@nestjs/common';
import { MessageEntity } from '../../../domain/message.entity';
import { ChatEntity } from '../../../../chat/domain/chat.entity';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageOutputDto {
  @ApiProperty()
  chatId: string;

  @ApiProperty()
  messageId: string;
}

@Injectable()
export class SendMessageOutputDtoMapper {
  map(message: MessageEntity, chat: ChatEntity): SendMessageOutputDto {
    return {
      chatId: chat.id,
      messageId: message.id,
    };
  }
}
