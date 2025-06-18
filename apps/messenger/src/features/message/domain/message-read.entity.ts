import { MessageReadStatus } from '@prisma/messenger';

export class MessageReadEntity implements MessageReadStatus {
  id: string;
  createdAt: Date;
  userId: string;
  messageId: string;

  constructor(dto: MessageReadStatus) {
    this.id = dto.id;
    this.userId = dto.userId;
    this.createdAt = dto.createdAt;
    this.messageId = dto.messageId;
  }
}
