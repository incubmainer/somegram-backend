import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  MyPaymentsOutputDto,
  myPaymentsMapper,
} from '../../../api/dto/output-dto/payments.output-dto';
import { PaymentsRepository } from '../../../infrastructure/payments.repository';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { SearchQueryParameters } from '../../../../../../../gateway/src/common/domain/query.types';
import { getSanitizationQuery } from '../../../../../../../gateway/src/common/utils/query-params.sanitizator';
import { LoggerService } from '@app/logger';
import { Pagination, PaginatorService } from '@app/paginator';

export class GetPaymentsQuery {
  constructor(
    public userId: string,
    public queryString?: SearchQueryParameters,
  ) {}
}

@QueryHandler(GetPaymentsQuery)
export class GetPaymentsQueryUseCase
  implements IQueryHandler<GetPaymentsQuery>
{
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly appNotification: ApplicationNotification,
    private readonly logger: LoggerService,
    private readonly paginatorService: PaginatorService,
  ) {
    this.logger.setContext(GetPaymentsQueryUseCase.name);
  }

  async execute(
    command: GetPaymentsQuery,
  ): Promise<AppNotificationResultType<Pagination<MyPaymentsOutputDto[]>>> {
    this.logger.debug('Execute: get payments by user id', this.execute.name);

    const sanitizationQuery = getSanitizationQuery(command.queryString);
    try {
      const { payments, count } =
        await this.paymentsRepository.getPaymentsByUserId(
          command.userId,
          sanitizationQuery,
        );

      const mapPayments: MyPaymentsOutputDto[] = myPaymentsMapper(payments);
      const result = this.paginatorService.create(
        sanitizationQuery.pageNumber,
        sanitizationQuery.pageSize,
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
