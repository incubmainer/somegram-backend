import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Pagination } from '@app/paginator';
import { CommentModel } from './comment.model';

@ObjectType()
export class PaginatedCommentModel extends Pagination<CommentModel[]> {
  @Field(() => Int)
  totalCount: number;

  @Field(() => Int)
  pageNumber: number;

  @Field(() => Int)
  pagesCount: number;

  @Field(() => Int)
  pageSize: number;

  @Field(() => [CommentModel])
  items: CommentModel[];
}
