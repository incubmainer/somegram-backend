import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { AccountType } from '../../../../../../libs/common/enums/payments';
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
  avatarURL: string;

  @Field({ nullable: true })
  profileLink: string;

  @Field()
  isDeleted: boolean;

  @Field(() => UserBanInfo, { nullable: true })
  banInfo?: UserBanInfo;
}
