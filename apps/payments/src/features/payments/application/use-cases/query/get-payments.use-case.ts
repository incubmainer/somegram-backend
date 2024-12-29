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
import { SearchQueryParametersType } from '../../../../../../../gateway/src/common/domain/query.types';
import { getSanitizationQuery } from '../../../../../../../gateway/src/common/utils/query-params.sanitizator';
import { Paginator } from '../../../../../../../gateway/src/common/domain/paginator';

export class GetPaymentsQuery {
  constructor(
    public userId: string,
    public queryString?: SearchQueryParametersType,
  ) {}
}

@QueryHandler(GetPaymentsQuery)
export class GetPaymentsQueryUseCase
  implements IQueryHandler<GetPaymentsQuery>
{
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly appNotification: ApplicationNotification,
  ) {}

  async execute(
    command: GetPaymentsQuery,
  ): Promise<AppNotificationResultType<Paginator<MyPaymentsOutputDto[]>>> {
    const sanitizationQuery = getSanitizationQuery(command.queryString);
    try {
      const { payments, count } =
        await this.paymentsRepository.getPaymentsByUserId(
          command.userId,
          sanitizationQuery,
        );

      const mapPayments: MyPaymentsOutputDto[] = myPaymentsMapper(payments);
      const result = new Paginator<MyPaymentsOutputDto[]>(
        sanitizationQuery.pageSize,
        count,
        mapPayments,
      );

      return this.appNotification.success(result);
    } catch (e) {
      console.error(e);
      return this.appNotification.internalServerError();
    }
  }
}
