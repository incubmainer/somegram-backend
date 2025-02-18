import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';

import { Pagination, PaginatorService } from '@app/paginator';
import { LoggerService } from '@app/logger';
import { SearchQueryParametersType } from '../../../../../../../../gateway/src/common/domain/query.types';
import { GraphqlPaymentsRepository } from '../../../../infrastructure/graphql-payments.repository';
import {
  myPaymentsMapper,
  MyPaymentsOutputDto,
} from '../../../../api/dto/output-dto/payments.output-dto';

export class GetAllPaymentsQuery {
  constructor(public queryString?: SearchQueryParametersType) {}
}

@QueryHandler(GetAllPaymentsQuery)
export class GetAllPaymentsQueryUseCase
  implements IQueryHandler<GetAllPaymentsQuery>
{
  constructor(
    private readonly graphqlPaymentsRepository: GraphqlPaymentsRepository,
    private readonly appNotification: ApplicationNotification,
    private readonly logger: LoggerService,
    private readonly paginatorService: PaginatorService,
  ) {
    this.logger.setContext(GetAllPaymentsQueryUseCase.name);
  }

  async execute(
    command: GetAllPaymentsQuery,
  ): Promise<AppNotificationResultType<Pagination<MyPaymentsOutputDto[]>>> {
    this.logger.debug('Execute: get payments by user id', this.execute.name);

    try {
      const { payments, count } =
        await this.graphqlPaymentsRepository.getAllPayments(
          command.queryString,
        );

      const result = this.paginatorService.create<any[]>(
        command.queryString.pageNumber,
        command.queryString.pageSize,
        count,
        payments,
      );

      return this.appNotification.success(result);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
