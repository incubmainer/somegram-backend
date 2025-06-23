import { MessageTypeEnum } from '../../message/domain/types';

export class ChatLastMessageRawDto {
  id: string;
  content: string;
  chatId: string;
  createdAt: Date;
  userId: string;
}

export class ChatRawDto {
  id: string;
  createdAt: Date;
  participantId: string; // The second participant of the chat
  lastMessage: ChatLastMessageRawDto;
  isMine: boolean; // My last message in chat or not
  isMyRead: boolean;
}

export class CreateChatDto {
  createdAt: Date;
  currentParticipantId: string;
  participantId: string;
  message: string;
  messageType: MessageTypeEnum;
}
