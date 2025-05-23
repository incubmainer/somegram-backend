import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { AccountType } from '../../../../../../../libs/common/enums/payments';
import {
  UserFollowInfo,
  UserWithBanInfo,
} from '../../../users/domain/user.interfaces';
import { UserBanInfo } from './ban-info.user.model';

registerEnumType(AccountType, { name: 'AccountType' });

@ObjectType()
export class UserModel {
  @Field()
  id: string;

  @Field(() => Date)
  createdAt: Date;

  @Field()
  email: string;

  @Field()
  username: string;

  @Field({ nullable: true })
  about: string;

  @Field({ nullable: true })
  dateOfBirth: Date;

  @Field({ nullable: true })
  firstName: string;

  @Field({ nullable: true })
  lastName: string;

  @Field({ nullable: true })
  city: string;

  @Field({ nullable: true })
  country: string;

  @Field(() => AccountType)
  accountType: AccountType;

  @Field({ nullable: true })
  profileLink: string;

  @Field()
  isDeleted: boolean;

  @Field(() => UserBanInfo, { nullable: true })
  banInfo?: UserBanInfo;

  static mapUser(user: UserWithBanInfo, profileUrl: string): UserModel {
    return {
      ...user,
      accountType: user.accountType as AccountType,
      profileLink: `${profileUrl}/${user.id}`,
      banInfo: user.userBanInfo
        ? {
            banDate: user.userBanInfo.banDate,
            banReason: user.userBanInfo.banReason,
          }
        : null,
    };
  }
  static mapUsers(users: UserWithBanInfo[], profileUrl: string): UserModel[] {
    return users.map((user) => {
      return this.mapUser(user, profileUrl);
    });
  }
}

@ObjectType()
export class FollowerModel extends UserModel {
  @Field()
  subscriptionDate?: Date;

  static mapUserFollow(
    user: UserWithBanInfo,
    profileUrl: string,
    subscriptionDate: Date,
  ): FollowerModel {
    const baseUser = super.mapUser(user, profileUrl);

    return {
      ...baseUser,
      subscriptionDate,
    } as FollowerModel;
  }

  static mapFollowingInfo(
    userFollowInfo: UserFollowInfo[],
    profileUrl: string,
  ): FollowerModel[] {
    return userFollowInfo.map((info) => {
      return this.mapUserFollow(info.followee, profileUrl, info.createdAt);
    });
  }

  static mapFollowersInfo(
    userFollowInfo: UserFollowInfo[],
    profileUrl: string,
  ): FollowerModel[] {
    return userFollowInfo.map((info) => {
      return this.mapUserFollow(info.follower, profileUrl, info.createdAt);
    });
  }
}
