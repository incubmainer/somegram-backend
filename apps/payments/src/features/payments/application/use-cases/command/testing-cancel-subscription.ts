import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { PaymentsRepository } from '../../../infrastructure/payments.repository';
import { Subscription } from '@prisma/payments';
import { SubscriptionStatuses } from '../../../../../common/enum/transaction-statuses.enum';
import { GatewayServiceClientAdapter } from '../../../../../common/adapters/gateway-service-client.adapter';
import { PaymentSystem } from '../../../../../../../../libs/common/enums/payments';
import { PaymentManager } from '../../../../../common/managers/payment.manager';
export class TestingCancelSubscriptionUseCase {
  constructor(public userId: string) {}
}

@CommandHandler(TestingCancelSubscriptionUseCase)
export class TestingCancelSubscriptionUseCaseHandler
  implements
    ICommandHandler<
      TestingCancelSubscriptionUseCase,
      AppNotificationResultType<null>
    >
{
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly paymentManager: PaymentManager,
    private readonly appNotification: ApplicationNotification,
    private readonly gatewayServiceClientAdapter: GatewayServiceClientAdapter,
  ) {}
  async execute(
    command: TestingCancelSubscriptionUseCase,
  ): Promise<AppNotificationResultType<null>> {
    try {
      const { userId } = command;
      const subscription: Subscription | null =
        await this.paymentsRepository.getActiveSubscriptionByUserId(userId);

      if (!subscription) return this.appNotification.notFound();

      const date: Date = new Date();
      subscription.status = SubscriptionStatuses.Canceled;
      subscription.updatedAt = new Date();
      subscription.endDateOfSubscription = date;

      await this.paymentsRepository.updateSub(subscription);
      this.gatewayServiceClientAdapter.sendSubscriptionInfo({
        userId: userId,
        endDateOfSubscription: date,
      });

      await this.paymentManager.cancelSubscription(
        subscription.paymentSystem as PaymentSystem,
        subscription.paymentSystemSubId,
      );
      return this.appNotification.success(null);
    } catch (e) {
      console.log(e);
      return this.appNotification.internalServerError();
    }
  }
}
