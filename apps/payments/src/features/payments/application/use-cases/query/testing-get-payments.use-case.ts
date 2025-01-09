import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  MyPaymentsOutputDto,
  myPaymentsMapper,
} from '../../../api/dto/output-dto/payments.output-dto';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { SearchQueryParametersType } from '../../../../../../../gateway/src/common/domain/query.types';
import { getSanitizationQuery } from '../../../../../../../gateway/src/common/utils/query-params.sanitizator';
import { Paginator } from '../../../../../../../gateway/src/common/domain/paginator';
import { SubscriptionType } from '../../../../../../../../libs/common/enums/payments';
import { TransactionStatuses } from '../../../../../common/enum/transaction-statuses.enum';

const data = [];
(() => {
  for (let i = 0; i < 200; i++) {
    const randomSubscriptionType =
      Object.values(SubscriptionType)[
        Math.floor(Math.random() * Object.values(SubscriptionType).length)
      ];
    let price = 0;
    switch (randomSubscriptionType) {
      case SubscriptionType.MONTHLY:
        price = 10000;
        break;
      case SubscriptionType.DAY:
        price = 1000;
        break;
      case SubscriptionType.WEEKLY:
        price = 5000;
        break;
    }
    const randomStatus =
      Object.values(TransactionStatuses)[
        Math.floor(Math.random() * Object.values(TransactionStatuses).length)
      ];

    const payment = {
      id: `transaction-mock-id-${i + 1}`,
      subscriptionType: randomSubscriptionType,
      price: price,
      paymentSystem: 'STRIPE',
      status: randomStatus,
      dateOfPayment: new Date(),
      endDateOfSubscription: new Date(),
      subId: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    };

    data.push(payment);
  }
})();

console.log(data[0].price / 100);

export class TestingGetPaymentsQuery {
  constructor(
    public userId: string,
    public queryString?: SearchQueryParametersType,
  ) {}
}

@QueryHandler(TestingGetPaymentsQuery)
export class TestingGetPaymentsQueryUseCase
  implements
    IQueryHandler<
      TestingGetPaymentsQuery,
      AppNotificationResultType<Paginator<MyPaymentsOutputDto[]>>
    >
{
  constructor(private readonly appNotification: ApplicationNotification) {}

  async execute(
    command: TestingGetPaymentsQuery,
  ): Promise<AppNotificationResultType<Paginator<MyPaymentsOutputDto[]>>> {
    const sanitizationQuery = getSanitizationQuery(command.queryString);
    try {
      const { pageNumber, pageSize } = sanitizationQuery;

      const sortedPayments = [...data].sort((a, b) => {
        const dateA = new Date(a.dateOfPayment).getTime();
        const dateB = new Date(b.dateOfPayment).getTime();
        return dateB - dateA;
      });

      const startIndex = (pageNumber - 1) * pageSize;
      const paginatedPayments = sortedPayments.slice(
        startIndex,
        startIndex + pageSize,
      );
      const count = data.length;

      const mapPayments: MyPaymentsOutputDto[] =
        myPaymentsMapper(paginatedPayments);
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
