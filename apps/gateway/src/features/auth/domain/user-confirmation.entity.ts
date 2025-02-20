import { UserConfirmationToken } from '@prisma/gateway';

export class UserConfirmationEntity implements UserConfirmationToken {
  userId: string;
  token: string;
  expiredAt: Date;
  createdAt: Date;

  constructor(dto: UserConfirmationToken) {
    this.userId = dto.userId;
    this.token = dto.token;
    this.expiredAt = dto.expiredAt;
    this.createdAt = dto.createdAt;
  }

  updateConfirmation(token: string, expiredAt: Date): void {
    this.token = token;
    this.expiredAt = expiredAt;
  }
}
