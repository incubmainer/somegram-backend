import { MessageReadStatus, Message, Participant } from '@prisma/messenger';
import { MessageEntity } from './message.entity';
import { MessageReadEntity } from './message-read.entity';
import { ParticipantEntity } from '../../chat/domain/participant.entity';

export class CreateNewMessageDto {
  message: string;
  chatId: string;
  createdAt: Date;
  senderId: string;
  messageType: MessageTypeEnum;
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

export class MessageWithReadStatusAndParticipants {
  message: MessageEntity;
  messageReadStatus: MessageReadEntity[] | null;
  participants: ParticipantEntity[];
}

export enum MessageTypeEnum {
  TEXT = 'text',
  VOICE = 'voice',
  FILE = 'file',
}
