import { Inject, Injectable } from '@nestjs/common';
import { LoggerService } from '@app/logger';
import { PaymentsRepository } from '../infrastructure/payments.repository';
import { Subscription } from '@prisma/payments';
import { SubscriptionEntity } from '../domain/subscription.entity';
import { Cron } from '@nestjs/schedule';
import { GatewayServiceClientAdapter } from '../../../common/adapters/gateway-service-client.adapter';
import {
  PaymentSystem,
  SubscriptionType,
} from '../../../../../../libs/common/enums/payments';
import { PayPalAdapter } from '../../../common/adapters/paypal.adapter';

@Injectable()
export class PaymentService {
  constructor(
    private readonly logger: LoggerService,
    private readonly paymentsRepository: PaymentsRepository,
    @Inject(SubscriptionEntity.name)
    private readonly subscriptionEntity: typeof SubscriptionEntity,
    private readonly gatewayServiceClientAdapter: GatewayServiceClientAdapter,
    private readonly payPalAdapter: PayPalAdapter,
  ) {
    this.logger.setContext(PaymentService.name);
  }

  @Cron('0 0 * * * *')
  private async execute(): Promise<void> {
    this.logger.debug('Execute payment service crone', this.execute.name);
    this.disableSubscription();
  }

  private shouldCancelPayPalSubscription(
    subscription: Subscription,
    currentDate: Date,
  ): boolean {
    const subscriptionDayEnd = this.formatDate(
      subscription.endDateOfSubscription,
    );
    const currentDay = this.formatDate(currentDate);
    const currentHours = currentDate.getHours();

    return +currentDay === +subscriptionDayEnd && currentHours > 10;
  }

  private formatDate(date: Date): string {
    return String(date.getDate()).padStart(2, '0');
  }

  public async disableSubscription(): Promise<void> {
    this.logger.debug(
      'Execute: disable subscription',
      this.disableSubscription.name,
    );
    try {
      const date: Date = new Date();
      const subscriptions: Subscription[] | null =
        await this.paymentsRepository.getSubscriptionByStatusAndDate(date);

      if (!subscriptions) return;

      subscriptions.forEach((subscription: Subscription): void => {
        if (subscription.paymentSystem === PaymentSystem.PAYPAL) {
          if (this.shouldCancelPayPalSubscription(subscription, date)) {
            this.subscriptionEntity.cancelSubscription(subscription);
          }
        } else {
          this.subscriptionEntity.cancelSubscription(subscription);
        }
      });

      await this.paymentsRepository.updateManySub(subscriptions);

      // TODO на Gateway отправлять данные о завершении подписки
      //await this.gatewayServiceClientAdapter.sendSubscriptionInfo();
    } catch (e) {
      this.logger.error(e, this.disableSubscription.name);
    }
  }

  public handleDateEnd(paymentDate: Date, planName: SubscriptionType): Date {
    const date: Date = new Date(paymentDate);
    switch (planName) {
      case SubscriptionType.DAY:
        date.setDate(date.getDate() + 1);
        return date;
      case SubscriptionType.WEEKLY:
        date.setDate(date.getDate() + 7);
        return date;
      case SubscriptionType.MONTHLY:
        date.setMonth(date.getMonth() + 1);
        return date;
      default:
        return new Date();
    }
  }

  // TODO выполнение в одной транзакции
  public async handleActiveSubscription(userId: string): Promise<void> {
    this.logger.debug(
      'Execute: handle active subscription',
      this.handleActiveSubscription.name,
    );
    const activeSubscription: Subscription | null =
      await this.paymentsRepository.getActiveOrPendingOrSuspendSubscriptionByUserId(
        userId,
      );

    if (activeSubscription && activeSubscription.isActive) {
      switch (activeSubscription.paymentSystem) {
        case PaymentSystem.PAYPAL:
          await this.payPalAdapter.cancelSubscription(
            activeSubscription.paymentSystemSubId,
          );
          break;
        case PaymentSystem.STRIPE:
          // TODO Stripe
          break;
        default:
          throw new Error('Unexpected payment system');
      }
      this.subscriptionEntity.unActiveSubscription(activeSubscription);
      await this.paymentsRepository.updateSub(activeSubscription);
    }
  }
}
