import { User, UserBanInfo } from '@prisma/gateway';
export interface UserWithBanInfo extends User {
  UserBanInfo: UserBanInfo | null;
}
