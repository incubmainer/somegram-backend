import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';

import { LoggerService } from '@app/logger';
import { GraphqlPaymentsRepository } from '../../../../infrastructure/graphql-payments.repository';
import { Subscription } from '@prisma/payments';

export class GetPaymentsByUsersQuery {
  constructor(public userIds: string[]) {}
}

@QueryHandler(GetPaymentsByUsersQuery)
export class GetPaymentsByUsersQueryUseCase
  implements IQueryHandler<GetPaymentsByUsersQuery>
{
  constructor(
    private readonly graphqlPaymentsRepository: GraphqlPaymentsRepository,
    private readonly appNotification: ApplicationNotification,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GetPaymentsByUsersQueryUseCase.name);
  }

  async execute(
    command: GetPaymentsByUsersQuery,
  ): Promise<AppNotificationResultType<Subscription[]>> {
    this.logger.debug('Execute: get subs by users ids', this.execute.name);
    const { userIds } = command;
    try {
      const subs =
        await this.graphqlPaymentsRepository.getSubscriptionsByUserIds(userIds);

      return this.appNotification.success(subs);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
