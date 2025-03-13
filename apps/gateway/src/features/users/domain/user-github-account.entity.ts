import { UserGithubInfo } from '@prisma/gateway';

export class UserGithubAccountEntity implements UserGithubInfo {
  userId: string;
  email: string;
  githubId: string;
  userName: string;
  displayName: string;

  constructor(dto: UserGithubInfo) {
    this.userId = dto.userId;
    this.githubId = dto.githubId;
    this.email = dto.email;
    this.userName = dto.userName;
    this.displayName = dto.displayName;
  }
}
