import { UserResetPasswordCode } from '@prisma/gateway';

export class UserResetPasswordEntity implements UserResetPasswordCode {
  userId: string;
  code: string;
  expiredAt: Date;
  createdAt: Date;

  constructor(dto: UserResetPasswordCode) {
    this.userId = dto.userId;
    this.code = dto.code;
    this.expiredAt = dto.expiredAt;
    this.createdAt = dto.createdAt;
  }

  updateResetPassword(code: string, expiredAt: Date): void {
    this.code = code;
    this.expiredAt = expiredAt;
  }
}
