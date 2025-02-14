import { Field, Int, ObjectType } from '@nestjs/graphql';

import { PaymentsModel } from './subscription.payments.model';

@ObjectType()
export class PaginatedPaymentsModel {
  @Field(() => Int)
  pageNumber: number;

  @Field(() => Int)
  pageSize: number;

  @Field(() => Int)
  pagesCount: number;

  @Field(() => Int)
  totalCount: number;

  @Field(() => [PaymentsModel])
  items: PaymentsModel[];
}
