import { AggregateRoot } from '@nestjs/cqrs';
import { Chat } from '@prisma/messenger';

export class ChatEntity extends AggregateRoot implements Chat {
  id: string;
  createdAt: Date;

  constructor(dto: Chat) {
    super();
    this.id = dto.id;
    this.createdAt = dto.createdAt;
  }
}
