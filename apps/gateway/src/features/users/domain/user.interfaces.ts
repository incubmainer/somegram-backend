import { User, UserBanInfo } from '@prisma/gateway';
export interface UserWithBanInfo extends User {
  userBanInfo: UserBanInfo | null;
}
