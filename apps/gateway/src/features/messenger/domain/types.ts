import { FileDto } from '../../posts/api/dto/input-dto/add-post.dto';

export class ChatMessagesDtoParticipantsDto {
  userId: string;
  readStatus: boolean;
  readAt: Date | null;
}

export class ChatMessagesDto {
  id: string;
  content: string;
  createdAt: Date;
  chatId: string;
  messageType: MessageTypeEnum;
  sender: ChatMessagesDtoParticipantsDto;
  participant: ChatMessagesDtoParticipantsDto;
  duration?: number;
  fileUrl?: string;
}

class LastChatMessageOutputDto {
  id: string;
  isMine: boolean;
  content: string;
  createdAt: Date;
  myReadStatus: boolean;
}

export class AllUserChatsDto {
  id: string;
  participantId: string;
  lastMessage: LastChatMessageOutputDto;
  avatarUrl?: string | null;
  isBan?: boolean;
  username?: string;
}

export class ChatDto {
  id: string;
  createdAt: Date;
}

export class CreateMessageDto {
  currentParticipantId: string;
  participantId: string;
  message: string | null;
  type: MessageTypeEnum;
}

export enum MessageTypeEnum {
  TEXT = 'text',
  VOICE = 'voice',
  FILE = 'file',
}

export class CreteVoiceMessageDto {
  message: Buffer;
  currentParticipantId: string;
  participantId: string;
}
export class ReadMessageDto {
  userId: string;
  messageId: string;
}

export class NewMessageGatewayDto {
  message: ChatMessagesDto;
  participantId: string;
}

export class SendMessageDto {
  chatId: string;
  messageId: string;
}

export class UploadFileMessageDto {
  messageId: string;
  chatId: string;
  message: FileDto;
  ownerId: string;
  participantId: string;
  type: MessageTypeEnum;
}

export class FileMessageOutputDto {
  url: string;
  ownerId: string;
  size: number;
  messageId: string;
  chatId: string;
  duration: number;
  key: string;
}
