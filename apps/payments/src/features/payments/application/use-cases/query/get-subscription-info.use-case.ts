import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  SubscriptionInfoOutputDto,
  subscriptionInfoMapper,
} from '../../../api/dto/output-dto/payments.output-dto';
import { PaymentsRepository } from '../../../infrastructure/payments.repository';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';

export class GetSubscriptionInfoQuery {
  constructor(public userId: string) {}
}

@QueryHandler(GetSubscriptionInfoQuery)
export class GetSubscriptionInfoQueryUseCase
  implements
    IQueryHandler<
      GetSubscriptionInfoQuery,
      AppNotificationResultType<SubscriptionInfoOutputDto>
    >
{
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly appNotification: ApplicationNotification,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GetSubscriptionInfoQueryUseCase.name);
  }

  async execute(
    command: GetSubscriptionInfoQuery,
  ): Promise<AppNotificationResultType<SubscriptionInfoOutputDto>> {
    this.logger.debug(
      'Execute: get subscription info by user id',
      this.execute.name,
    );
    try {
      const sub = await this.paymentsRepository.getActiveSubscriptionByUserId(
        command.userId,
      );

      if (!sub) return this.appNotification.notFound();

      const mapSub: SubscriptionInfoOutputDto = subscriptionInfoMapper(sub);

      return this.appNotification.success(mapSub);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
