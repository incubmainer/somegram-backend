import { Inject, Injectable } from '@nestjs/common';
import { IPayPalEventHandler } from '../../../../../common/interfaces/paypal-event-handler.interface';
import {
  PayPalWebHookEventType,
  WHSubscriptionCancelledType,
} from '../../../../../common/adapters/types/paypal/types';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { PaymentsRepository } from '../../../infrastructure/payments.repository';
import { Subscription } from '@prisma/payments';
import { SubscriptionStatuses } from '../../../../../common/enum/transaction-statuses.enum';
import {
  SubscriptionEntity,
  SubscriptionUpdateDto,
} from '../../../domain/subscription.entity';
import { LoggerService } from '@app/logger';

@Injectable()
export class PaypalSubscriptionCancelHandler
  implements
    IPayPalEventHandler<PayPalWebHookEventType<WHSubscriptionCancelledType>>
{
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly appNotification: ApplicationNotification,
    @Inject(SubscriptionEntity.name)
    private readonly subscriptionEntity: typeof SubscriptionEntity,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PaypalSubscriptionCancelHandler.name);
  }

  // TODO С блокировкой сделать чтобы небыло расхожденией по различным ивентам которые приходят
  async handle(
    event: PayPalWebHookEventType<WHSubscriptionCancelledType>,
  ): Promise<AppNotificationResultType<null>> {
    try {
      this.logger.debug('Execute: cancel subscription', this.handle.name);
      const { id, custom_id } = event.resource;

      const subscription: Subscription | null =
        await this.paymentsRepository.getSubscriptionByPaymentSystemSubId(id);

      if (!subscription) return this.appNotification.notFound();

      const subscriptionUpdateData: SubscriptionUpdateDto =
        this.generateDataUpdateSubscription(
          custom_id,
          subscription.endDateOfSubscription,
          subscription.status as SubscriptionStatuses,
        );

      this.subscriptionEntity.update(subscription, subscriptionUpdateData);

      await this.paymentsRepository.updateSub(subscription);
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.handle.name);
      return this.appNotification.internalServerError();
    }
  }

  private generateDataUpdateSubscription(
    customerId: string,
    dateEnd: Date,
    status: SubscriptionStatuses,
  ): SubscriptionUpdateDto {
    let updateStatus: SubscriptionStatuses = null;
    if (status === SubscriptionStatuses.Pending) {
      updateStatus = SubscriptionStatuses.Canceled;
    } else {
      dateEnd.toISOString() > new Date().toISOString()
        ? (updateStatus = SubscriptionStatuses.Active)
        : (updateStatus = SubscriptionStatuses.Canceled);
    }
    return {
      updatedAt: new Date(),
      paymentSystemCustomerId: customerId,
      status: updateStatus,
      isActive: false,
    };
  }
}
