import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { Pagination } from '@app/paginator';

import { PaymentsModel } from './models/subscription.payments.model';
import { PaginatedPaymentsModel } from './models/paginated-payments.model';
import { BasicGqlGuard } from '../../common/guards/graphql/basic-gql.guard';
import { PaymentsServiceAdapter } from '../../common/adapter/payment-service.adapter';
import { QueryStringInput } from '../users/models/query-string-input';
import { UserLoader } from '../../common/data-loaders/user-loader';
import { UserModel } from '../users/models/user.model';
import { MyPaymentsOutputDto } from '../../features/subscriptions/api/dto/output-dto/subscriptions.output-dto';

@Resolver(() => PaymentsModel)
export class PaymentsResolver {
  constructor(
    private readonly paymentsServiceAdapter: PaymentsServiceAdapter,
    private readonly userLoader: UserLoader,
    private readonly logger: LoggerService,
  ) {}

  @Query(() => PaginatedPaymentsModel)
  @UseGuards(BasicGqlGuard)
  async getPaymentsByUser(
    @Args('queryString', { type: () => QueryStringInput, nullable: true })
    queryString: QueryStringInput,
    @Args('userId') userId: string,
  ): Promise<PaginatedPaymentsModel> {
    this.logger.debug(
      'Execute: Get payments byuser',
      this.getPaymentsByUser.name,
    );
    const result: AppNotificationResultType<Pagination<MyPaymentsOutputDto[]>> =
      await this.paymentsServiceAdapter.getPayments({
        userId,
        queryString,
      });

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug(`Success`, this.getPaymentsByUser.name);
        //Возможно проще добавить в MyPaymentsOutputDto userId
        return {
          ...result.data,
          items: result.data.items.map((i) => {
            return {
              ...i,
              userId,
            };
          }),
        };
      default:
        throw new InternalServerErrorException();
    }
  }

  @ResolveField(() => UserModel, { nullable: true })
  async getUser(@Parent() paymentsModel: PaymentsModel) {
    return this.userLoader.generateDataLoader().load(paymentsModel.userId);
  }
}
