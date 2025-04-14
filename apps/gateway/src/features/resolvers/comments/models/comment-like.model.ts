import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CommentLikeModel {
  @Field()
  like: number;

  @Field()
  dislike: number;
}
