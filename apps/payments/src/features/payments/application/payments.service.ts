import { Inject, Injectable } from '@nestjs/common';
import { LoggerService } from '@app/logger';
import { PaymentsRepository } from '../infrastructure/payments.repository';
import { Subscription } from '@prisma/payments';
import {
  ActiveSubscriptionDateType,
  SubscriptionEntity,
} from '../domain/subscription.entity';
import { Cron } from '@nestjs/schedule';
import { GatewayServiceClientAdapter } from '../../../common/adapters/gateway-service-client.adapter';
import {
  PaymentSystem,
  SubscriptionType,
} from '../../../../../../libs/common/enums/payments';
import { PaymentManager } from '../../../common/managers/payment.manager';
import { SubscriptionStatuses } from '../../../common/enum/subscription-types.enum';
import { SubscriptionInfoGatewayType } from '../../../../../gateway/src/features/subscriptions/domain/types';
import { CreateNotificationInputDto } from '../../../../../gateway/src/features/notification/api/dto/input-dto/notification.input-dto';
import { ConvertDateUtil } from '../../../common/utils/convert-date.util';

@Injectable()
export class PaymentService {
  constructor(
    private readonly logger: LoggerService,
    private readonly paymentsRepository: PaymentsRepository,
    @Inject(SubscriptionEntity.name)
    private readonly subscriptionEntity: typeof SubscriptionEntity,
    private readonly gatewayServiceClientAdapter: GatewayServiceClientAdapter,
    private readonly paymentManager: PaymentManager,
    private readonly convertDateUtil: ConvertDateUtil,
  ) {
    this.logger.setContext(PaymentService.name);
  }

  @Cron('0 0 * * * *')
  private async execute(): Promise<void> {
    this.logger.debug('Execute payment service crone', this.execute.name);
    this.disableSubscription();
  }

  @Cron('0 0 * * *')
  private async execute12Am(): Promise<void> {
    this.logger.debug('Execute payment service crone', this.execute12Am.name);
    this.checkAndNotifySubscriptionEnd();
  }

  private shouldCancelPayPalSubscription(
    subscription: Subscription,
    date: Date,
  ): boolean {
    const pstDate: Date = this.getPSTDate(date);
    const currentHoursPstTime = pstDate.getHours();
    const subscriptionDateEnd = new Date(subscription.endDateOfSubscription);

    return subscriptionDateEnd < date && currentHoursPstTime > 6;
  }

  private getPSTDate(date: Date): Date {
    const pstOffset = -8 * 60 * 60 * 1000;
    const pstTimestamp = date.getTime() + pstOffset;
    return new Date(pstTimestamp);
  }

  private async checkAndNotifySubscriptionEnd(): Promise<void> {
    this.logger.debug(
      'Execute: Verification of the deadline for the subscription for notification',
      this.checkAndNotifySubscriptionEnd.name,
    );

    try {
      const date = new Date();
      const subscriptions =
        await this.paymentsRepository.getActiveSubscriptions();

      if (!subscriptions || subscriptions.length === 0) return;

      const data: CreateNotificationInputDto[] = [];

      for (const subscription of subscriptions) {
        const subEndAt = new Date(subscription.endDateOfSubscription);

        const startOfDay = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
        );
        const subEndOfDay = new Date(
          subEndAt.getFullYear(),
          subEndAt.getMonth(),
          subEndAt.getDate(),
        );

        const diffInMs = subEndOfDay.getTime() - startOfDay.getTime();

        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInDays === 7) {
          data.push({
            userId: subscription.userId,
            message: `Your subscription expires after 7 days.`,
          });
        }

        if (diffInDays === 1) {
          if (subscription.autoRenewal) {
            data.push({
              userId: subscription.userId,
              message: `The next payment will be drunk after 1 day.`,
            });
          }
          data.push({
            userId: subscription.userId,
            message: `Your subscription expires after 1 day.`,
          });
        }
      }

      if (data.length > 0)
        this.gatewayServiceClientAdapter.createSubscriptionNotifications(data);
    } catch (e) {
      this.logger.error(e, this.checkAndNotifySubscriptionEnd.name);
    }
  }

  public async disableSubscription(): Promise<void> {
    this.logger.debug(
      'Execute: disable subscription',
      this.disableSubscription.name,
    );
    try {
      const date: Date = new Date();

      const subscriptions: Subscription[] | null =
        await this.paymentsRepository.getActiveSubscriptionsByDate(date);
      const suspendedSubscriptionsIds: string[] = [];
      const gatewayData: SubscriptionInfoGatewayType[] = [];

      if (!subscriptions) return;

      subscriptions.forEach((subscription: Subscription): void => {
        if (subscription.paymentSystem === PaymentSystem.PAYPAL) {
          if (this.shouldCancelPayPalSubscription(subscription, date)) {
            if (subscription.status === SubscriptionStatuses.Suspended)
              suspendedSubscriptionsIds.push(subscription.paymentSystemSubId);

            gatewayData.push({
              userId: subscription.userId,
              endDateOfSubscription: subscription.endDateOfSubscription,
            });

            this.subscriptionEntity.cancelSubscription(subscription);
          }
        } else {
          gatewayData.push({
            userId: subscription.userId,
            endDateOfSubscription: subscription.endDateOfSubscription,
          });
          this.subscriptionEntity.cancelSubscription(subscription);
        }
      });

      if (suspendedSubscriptionsIds.length > 0)
        await this.paymentManager.cancelManySubscriptions(
          PaymentSystem.PAYPAL,
          suspendedSubscriptionsIds,
        );

      await this.paymentsRepository.updateManySub(subscriptions);

      if (gatewayData.length > 0)
        this.gatewayServiceClientAdapter.sendSubscriptionsInfo(gatewayData);
    } catch (e) {
      this.logger.error(e, this.disableSubscription.name);
    }
  }

  public handleDateEnd(paymentDate: Date, planName: SubscriptionType): Date {
    const date = new Date(paymentDate);
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

  // TODO выполнение в одной транзакции и в местах где вызывается делаем rollback
  public async handleActiveSubscription(
    userId: string,
    processedSubId: string,
  ): Promise<ActiveSubscriptionDateType | null> {
    this.logger.debug(
      'Execute: handle active subscription',
      this.handleActiveSubscription.name,
    );

    const activeSubscription: Subscription | null =
      await this.paymentsRepository.getActiveSubscriptionByUserId(userId);

    if (activeSubscription && activeSubscription.id !== processedSubId) {
      await this.paymentManager.cancelSubscription(
        activeSubscription.paymentSystem as PaymentSystem,
        activeSubscription.paymentSystemSubId,
      );
      this.subscriptionEntity.cancelSubscription(activeSubscription);
      await this.paymentsRepository.updateSub(activeSubscription);

      return {
        dateOfPayment: activeSubscription.dateOfPayment,
        dateEndSubscription: activeSubscription.endDateOfSubscription,
      };
    }

    return null;
  }

  public sendNotificationAfterSuccessPayment(userId: string, date: Date) {
    this.gatewayServiceClientAdapter.createSubscriptionNotificationWithDelay({
      userId,
      message: `Your subscription is activated and acts before: ${this.convertDateUtil.convertToDdMmYy(date)}`,
    });
  }
}
