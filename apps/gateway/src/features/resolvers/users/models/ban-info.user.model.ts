import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserBanInfo {
  @Field()
  banReason: string;

  @Field(() => Date)
  banDate: Date;
}
