import { UseGuards } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { PaymentsModel } from './models/subscription.payments.model';
import { PaginatedPaymentsModel } from './models/paginated-payments.model';
import { BasicGqlGuard } from '../../common/guards/graphql/basic-gql.guard';
import { PaymentsServiceAdapter } from '../../common/adapter/payment-service.adapter';
import { QueryStringInput } from '../users/models/pagination-users-input';
import { UserLoader } from '../../common/data-loaders/user-loader';
import { UserModel } from '../users/models/user.model';

@Resolver(() => PaymentsModel)
export class PaymentsResolver {
  constructor(
    private readonly paymentsServiceAdapter: PaymentsServiceAdapter,
    private readonly userLoader: UserLoader,
  ) {}

  @Query(() => PaginatedPaymentsModel)
  @UseGuards(BasicGqlGuard)
  async getPaymentsByUser(
    @Args('queryString', { type: () => QueryStringInput, nullable: true })
    queryString: QueryStringInput,
    @Args('userId') userId: string,
  ): Promise<PaginatedPaymentsModel> {
    const payments = await this.paymentsServiceAdapter.getPayments({
      userId,
      queryString,
    });
    //Возможно проще добавить в MyPaymentsOutputDto userId
    return {
      ...payments.data,
      items: payments.data.items.map((i) => {
        return {
          ...i,
          userId,
        };
      }),
    };
  }

  @ResolveField(() => UserModel, { nullable: true })
  async getUser(@Parent() paymentsModel: PaymentsModel) {
    return this.userLoader.generateDataLoader().load(paymentsModel.userId);
  }
}
