import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PostLastLikeModel {
  @Field()
  userId: string;
}

@ObjectType()
export class PostLikeModel {
  @Field()
  like: number;

  @Field(() => [PostLastLikeModel])
  lastLike: PostLastLikeModel[];
}
