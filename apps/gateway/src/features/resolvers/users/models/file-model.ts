import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FileModel {
  @Field({ nullable: true })
  ownerId: string;

  @Field({ nullable: true })
  createdAt: string;

  @Field({ nullable: true })
  originalname: string;

  @Field({ nullable: true })
  size: number;

  @Field({ nullable: true })
  url: string;

  @Field({ nullable: true })
  key: string;

  @Field({ nullable: true })
  postId?: string;
}
