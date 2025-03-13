import { UserGoogleInfo } from '@prisma/gateway';

export class UserGoogleAccount implements UserGoogleInfo {
  userId: string;
  sub: string;
  email: string;
  emailVerified: boolean;

  constructor(dto: UserGoogleInfo) {
    this.userId = dto.userId;
    this.sub = dto.sub;
    this.email = dto.email;
    this.emailVerified = dto.emailVerified;
  }
}
