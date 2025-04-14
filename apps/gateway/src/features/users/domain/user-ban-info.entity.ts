import { UserBanInfo } from '@prisma/gateway';

export class UserBanInfoEntity implements UserBanInfo {
  userId: string;
  banReason: string;
  banDate: Date;

  constructor(dto: UserBanInfo) {
    this.userId = dto.userId;
    this.banDate = dto.banDate;
    this.banReason = dto.banReason;
  }
}
