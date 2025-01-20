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
import { LoggerService } from '@app/logger';
import { PaymentService } from '../../payments.service';

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
        return this.appNotification.success(null);
      }

      if (subscription.status !== SubscriptionStatuses.Suspended)
        return this.appNotification.success(null);

      await this.handleSuspend(subscription, custom_id);

      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.handle.name);
      return this.appNotification.internalServerError();
    }
  }

  private async handlePending(subscription: Subscription): Promise<void> {
    await this.paymentService.handleActiveSubscription(subscription.userId);
    this.subscriptionEntity.activateSubscription(subscription);
    await this.paymentsRepository.updateSub(subscription);
  }

  private async handleSuspend(
    subscription: Subscription,
    userId: string,
  ): Promise<void> {
    await this.paymentService.handleActiveSubscription(userId);
    const subscriptionUpdateData = this.generateDataUpdateSubscription(userId);
    this.subscriptionEntity.update(subscription, subscriptionUpdateData);
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
