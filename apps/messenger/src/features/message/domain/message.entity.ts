import { AggregateRoot } from '@nestjs/cqrs';
import { Message } from '@prisma/messenger';
import { NewMessageEvent } from '../application/events/new-message.event';

export class MessageEntity extends AggregateRoot implements Message {
  id: string;
  content: string;
  chatId: string;
  createdAt: Date;
  userId: string;

  constructor(dto: Message) {
    super();
    this.id = dto.id;
    this.userId = dto.userId;
    this.createdAt = dto.createdAt;
    this.content = dto.content;
    this.chatId = dto.chatId;
  }

  newMessageEvent(participantId: string): void {
    this.apply(new NewMessageEvent(this.id, participantId));
  }

  readMessageEvent(): void {}
}
