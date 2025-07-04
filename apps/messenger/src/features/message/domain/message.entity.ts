import { AggregateRoot } from '@nestjs/cqrs';
import { Message } from '@prisma/messenger';
import { NewMessageEvent } from '../application/events/new-message.event';
import { MessageReadEvent } from '../application/events/message-read.event';
import { MessageTypeEnum } from './types';

export class MessageEntity extends AggregateRoot implements Message {
  id: string;
  content: string | null;
  chatId: string;
  createdAt: Date;
  userId: string;
  messageType: MessageTypeEnum;

  constructor(dto: Message) {
    super();
    this.id = dto.id;
    this.userId = dto.userId;
    this.createdAt = dto.createdAt;
    this.content = dto.content;
    this.chatId = dto.chatId;
    this.messageType = dto.messageType as MessageTypeEnum;
  }

  newMessageEvent(participantId: string): void {
    this.apply(new NewMessageEvent(this.id, participantId));
  }

  readMessageEvent(participantId: string): void {
    this.apply(new MessageReadEvent(this.id, participantId));
  }
}
