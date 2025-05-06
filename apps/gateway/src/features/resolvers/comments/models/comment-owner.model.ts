import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CommentOwnerModel {
  @Field()
  id: string;

  @Field()
  username: string;

  @Field(() => String, { nullable: true })
  profileUrl?: string;
}
