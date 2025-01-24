import { Inject, Injectable } from '@nestjs/common';
import { IPayPalEventHandler } from '../../../../../common/interfaces/paypal-event-handler.interface';
import {
  PayPalWebHookEventType,
  WHSubscriptionActiveType,
} from '../../../../../common/adapters/types/paypal/types';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { PaymentsRepository } from '../../../infrastructure/payments.repository';
import { Subscription } from '@prisma/payments';
import {
  ActiveSubscriptionDateType,
  SubscriptionEntity,
} from '../../../domain/subscription.entity';
import { LoggerService } from '@app/logger';
import { PaymentService } from '../../payments.service';
import { SubscriptionStatuses } from '../../../../../common/enum/subscription-types.enum';

@Injectable()
export class PaypalSubscriptionActiveHandler
  implements
    IPayPalEventHandler<PayPalWebHookEventType<WHSubscriptionActiveType>>
{
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly appNotification: ApplicationNotification,
    @Inject(SubscriptionEntity.name)
    private readonly subscriptionEntity: typeof SubscriptionEntity,
    private readonly logger: LoggerService,
    private readonly paymentService: PaymentService,
  ) {
    this.logger.setContext(PaypalSubscriptionActiveHandler.name);
  }

  // TODO Блокировка
  async handle(
    event: PayPalWebHookEventType<WHSubscriptionActiveType>,
  ): Promise<AppNotificationResultType<null>> {
    try {
      this.logger.debug('Execute: activate subscription', this.handle.name);
      const { id } = event.resource;

      const subscription: Subscription | null =
        await this.paymentsRepository.getSubscriptionByPaymentSystemSubId(id);

      if (!subscription) return this.appNotification.notFound();

      if (subscription.status === SubscriptionStatuses.Pending) {
        await this.handlePending(subscription);
        return this.appNotification.success(null);
      }

      if (subscription.status !== SubscriptionStatuses.Suspended)
        return this.appNotification.success(null);

      await this.handleSuspend(subscription);

      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.handle.name);
      return this.appNotification.internalServerError();
    }
  }

  private async handlePending(subscription: Subscription): Promise<void> {
    const result: ActiveSubscriptionDateType | null =
      await this.paymentService.handleActiveSubscription(
        subscription.userId,
        subscription.id,
      );

    if (result) {
      this.subscriptionEntity.activateSubscription(
        subscription,
        result.dateOfPayment,
        result.dateEndSubscription,
      );
    } else {
      this.subscriptionEntity.activateSubscription(subscription);
    }

    await this.paymentsRepository.updateSub(subscription);
  }

  private async handleSuspend(subscription: Subscription): Promise<void> {
    this.subscriptionEntity.activateSubscription(subscription);
    await this.paymentsRepository.updateSub(subscription);
  }
}
