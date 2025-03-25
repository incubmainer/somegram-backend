import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { Pagination } from '@app/paginator';

import { PaymentsModel } from './models/payments.model';
import { PaginatedPaymentsModel } from './models/paginated-payments.model';
import { UserModel } from '../users/models/user.model';
import { PaymentsQueryStringInputWithSearch } from './models/payments-query-input-with-search';
import { PaymentsQueryStringInput } from './models/payments-query-string-input';
import { PaymentsServiceAdapter } from '../../../common/adapter/payment-service.adapter';
import { UserLoader } from '../../../common/data-loaders/user-loader';
import { BasicGqlGuard } from '../../../common/guards/graphql/basic-gql.guard';

@Resolver(() => PaymentsModel)
export class PaymentsResolver {
  constructor(
    private readonly paymentsServiceAdapter: PaymentsServiceAdapter,
    private readonly userLoader: UserLoader,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PaymentsResolver.name);
  }

  @Query(() => PaginatedPaymentsModel)
  @UseGuards(BasicGqlGuard)
  async getPaymentsByUser(
    @Args('queryString', {
      type: () => PaymentsQueryStringInput,
      nullable: false,
    })
    queryString: PaymentsQueryStringInput,
    @Args('userId') userId: string,
  ): Promise<PaginatedPaymentsModel> {
    this.logger.debug(
      'Execute: Get payments by user',
      this.getPaymentsByUser.name,
    );
    const result: AppNotificationResultType<PaginatedPaymentsModel> =
      await this.paymentsServiceAdapter.getPaymentsByUser({
        userId,
        queryString,
      });

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug(`Success`, this.getPaymentsByUser.name);
        return result.data;
      default:
        throw new InternalServerErrorException();
    }
  }

  @Query(() => PaginatedPaymentsModel)
  @UseGuards(BasicGqlGuard)
  async getAllPayments(
    @Args('queryString', {
      type: () => PaymentsQueryStringInputWithSearch,
      nullable: true,
    })
    queryString: PaymentsQueryStringInputWithSearch,
  ): Promise<Pagination<any[]>> {
    const res = await this.paymentsServiceAdapter.getAllPayments({
      queryString,
    });
    return res.data;
  }

  @ResolveField(() => UserModel, { nullable: true })
  async getUser(@Parent() paymentsModel: PaymentsModel) {
    return this.userLoader.generateDataLoader().load(paymentsModel.userId);
  }
}
