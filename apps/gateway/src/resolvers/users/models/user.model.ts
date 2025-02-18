import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { AccountType } from '../../../../../../libs/common/enums/payments';
import { UserBanInfo } from './ban-info.user.model';
import { UserWithBanInfo } from '../../../features/users/domain/user.interfaces';

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

  static mapUser(user: UserWithBanInfo): UserModel {
    return {
      ...user,
      accountType: user.accountType as AccountType,
      profileLink: `https://somegram.online/public-user/profile/${user.id}`,
      banInfo: user.UserBanInfo
        ? {
            banDate: user.UserBanInfo.banDate,
            banReason: user.UserBanInfo.banReason,
          }
        : null,
    };
  }
  static mapUsers(users: UserWithBanInfo[]): UserModel[] {
    return users.map((user) => {
      return this.mapUser(user);
    });
  }
}
