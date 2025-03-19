import { Field, Int, ObjectType } from '@nestjs/graphql';

import { UserModel } from './user.model';

@ObjectType()
export class PaginatedUserModel {
  @Field(() => Int)
  pageNumber: number;

  @Field(() => Int)
  pageSize: number;

  @Field(() => Int)
  pagesCount: number;

  @Field(() => Int)
  totalCount: number;

  @Field(() => [UserModel])
  items: UserModel[];
}
