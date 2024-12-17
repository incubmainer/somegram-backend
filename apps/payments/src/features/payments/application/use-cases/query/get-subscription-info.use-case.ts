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

export class GetSubscriptionInfoQuery {
  constructor(public userId: string) {}
}

@QueryHandler(GetSubscriptionInfoQuery)
export class GetSubscriptionInfoQueryUseCase
  implements IQueryHandler<GetSubscriptionInfoQuery>
{
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly appNotification: ApplicationNotification,
  ) {}

  async execute(
    command: GetSubscriptionInfoQuery,
  ): Promise<AppNotificationResultType<SubscriptionInfoOutputDto>> {
    try {
      const sub = await this.paymentsRepository.getActiveSubscriptionByUserId(
        command.userId,
      );
      if (!sub) {
        return this.appNotification.notFound();
      }
      const mapSub: SubscriptionInfoOutputDto = subscriptionInfoMapper(sub);

      return this.appNotification.success(mapSub);
    } catch (e) {
      console.error(e);
      return this.appNotification.internalServerError();
    }
  }
}
