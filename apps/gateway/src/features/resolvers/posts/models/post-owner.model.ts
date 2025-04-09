import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PostOwnerModel {
  @Field()
  userId: string;

  @Field()
  username: string;

  @Field(() => String, { nullable: true })
  profileUrl?: string;
}
