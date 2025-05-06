import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CommentModel {
  @Field()
  id: string;

  @Field()
  text: string;

  @Field(() => String, { nullable: true })
  answerForCommentId: string | null;

  @Field()
  answersCount: number;

  @Field()
  createdAt: Date;
}
