import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';

import { Pagination, PaginatorService } from '@app/paginator';
import { LoggerService } from '@app/logger';
import { SearchQueryParameters } from '../../../../../../../../gateway/src/common/domain/query.types';
import { GraphqlPaymentsRepository } from '../../../../infrastructure/graphql-payments.repository';
import {
  paymentsWithUserInfoMapper,
  PaymentsWithUserInfoOutputDto,
} from '../../../../api/dto/output-dto/payments.output-dto';

export class GetPaymentsByUserQuery {
  constructor(
    public userId: string,
    public queryString?: SearchQueryParameters,
  ) {}
}

@QueryHandler(GetPaymentsByUserQuery)
export class GetPaymentsByUserQueryUseCase
  implements IQueryHandler<GetPaymentsByUserQuery>
{
  constructor(
    private readonly graphqlPaymentsRepository: GraphqlPaymentsRepository,
    private readonly appNotification: ApplicationNotification,
    private readonly logger: LoggerService,
    private readonly paginatorService: PaginatorService,
  ) {
    this.logger.setContext(GetPaymentsByUserQueryUseCase.name);
  }

  async execute(
    command: GetPaymentsByUserQuery,
  ): Promise<
    AppNotificationResultType<Pagination<PaymentsWithUserInfoOutputDto[]>>
  > {
    this.logger.debug('Execute: get payments by user id', this.execute.name);

    try {
      const { payments, count } =
        await this.graphqlPaymentsRepository.getPaymentsByUserId(
          command.userId,
          command.queryString,
        );

      const mapPayments = paymentsWithUserInfoMapper(payments);

      const result = this.paginatorService.create<
        PaymentsWithUserInfoOutputDto[]
      >(
        command.queryString.pageNumber,
        command.queryString.pageSize,
        count,
        mapPayments,
      );

      return this.appNotification.success(result);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
