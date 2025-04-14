import { User, UserBanInfo, UserFollow } from '@prisma/gateway';
export interface UserWithBanInfo extends User {
  userBanInfo: UserBanInfo | null;
}

export interface UserFollowInfo extends UserFollow {
  follower?: UserWithBanInfo | null;
  followee?: UserWithBanInfo | null;
}
