import { MessageReadStatus, Message, Participant } from '@prisma/messenger';

export class CreateNewMessageDto {
  message: string;
  chatId: string;
  createdAt: Date;
  senderId: string;
}

export type MessageWithReadStatusAndParticipantsType = Message & {
  MessageReadStatus: MessageReadStatus[] | null;
  Chat: { Participants: Participant[] };
};

export type MessageWithReadStatusType = Message & {
  MessageReadStatus: MessageReadStatus[] | null;
};

export class CreateMessageReadDto {
  userId: string;
  messageId: string;
  createdAt: Date;
}
