export class ChatMessagesDto {
  id: string;
  content: string;
  createdAt: Date;
  senderId: string;
  chatId: string;
  isMine: boolean;
  myReadStatus: boolean;
  myReadAt: Date | null;
  participantReadStatus: boolean;
  participantReadAt: Date | null;
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
  message: string;
}

export class ReadMessageDto {
  userId: string;
  messageId: string;
}

export class NewMessageGatewayDto {
  message: ChatMessagesDto;
  participantId: string;
}
