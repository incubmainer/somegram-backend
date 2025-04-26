import { Participant } from '@prisma/messenger';

export class ParticipantEntity implements Participant {
  id: string;
  userId: string;
  createdAt: Date;
  chatId: string;

  constructor(dto: Participant) {
    this.id = dto.id;
    this.createdAt = dto.createdAt;
    this.userId = dto.userId;
    this.chatId = dto.chatId;
  }
}
