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
import { SubscriptionStatuses } from '../../../../../common/enum/transaction-statuses.enum';
import {
  SubscriptionEntity,
  SubscriptionUpdateDto,
} from '../../../domain/subscription.entity';
import { PayPalAdapter } from '../../../../../common/adapters/paypal.adapter';
import { LoggerService } from '@app/logger';

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
    private readonly payPalAdapter: PayPalAdapter,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PaypalSubscriptionActiveHandler.name);
  }

  // TODO С блокировкой сделать чтобы небыло расхожденией по различным ивентам которые приходят
  async handle(
    event: PayPalWebHookEventType<WHSubscriptionActiveType>,
  ): Promise<AppNotificationResultType<null>> {
    try {
      this.logger.debug('Execute: activate subscription', this.handle.name);
      const { id, custom_id } = event.resource;

      const subscription: Subscription | null =
        await this.paymentsRepository.getSubscriptionByPaymentSystemSubId(id);

      if (!subscription) return this.appNotification.notFound();

      if (subscription.status === SubscriptionStatuses.Pending) {
        await this.handlePending(subscription);
        await this.paymentsRepository.updateSub(subscription);
        return this.appNotification.success(null);
      }

      if (subscription.status !== SubscriptionStatuses.Suspended)
        return this.appNotification.success(null);

      const subscriptionUpdateData: SubscriptionUpdateDto =
        this.generateDataUpdateSubscription(custom_id);

      this.subscriptionEntity.update(subscription, subscriptionUpdateData);

      await this.paymentsRepository.updateSub(subscription);
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.handle.name);
      return this.appNotification.internalServerError();
    }
  }

  private async handlePending(subscription: Subscription): Promise<void> {
    const activeSubscription: Subscription | null =
      await this.paymentsRepository.getActiveOrPendingPaymentSystemSubscriptionByUserId(
        subscription.userId,
      );

    if (activeSubscription && activeSubscription.isActive) {
      await this.payPalAdapter.cancelSubscription(
        activeSubscription.paymentSystemSubId,
      );
      this.subscriptionEntity.unActiveSubscription(activeSubscription);
      await this.paymentsRepository.updateSub(activeSubscription);
    }

    this.subscriptionEntity.activateSubscription(subscription);
    await this.paymentsRepository.updateSub(subscription);
  }

  private generateDataUpdateSubscription(
    customerId: string,
  ): SubscriptionUpdateDto {
    return {
      updatedAt: new Date(),
      paymentSystemCustomerId: customerId,
      status: SubscriptionStatuses.Active,
      autoRenewal: true,
      isActive: true,
    };
  }
}
