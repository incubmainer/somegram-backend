import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Pagination } from '@app/paginator';
import { PostModel } from './post.model';

@ObjectType()
export class PaginatedPostsModel extends Pagination<PostModel[]> {
  @Field(() => Int)
  totalCount: number;

  @Field(() => Int)
  pageNumber: number;

  @Field(() => Int)
  pagesCount: number;

  @Field(() => Int)
  pageSize: number;

  @Field(() => [PostModel])
  items: PostModel[];
}
