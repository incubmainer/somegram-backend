import { Inject, Injectable } from '@nestjs/common';
import { IPayPalEventHandler } from '../../../../../common/interfaces/paypal-event-handler.interface';
import {
  PayPalPlansResponseType,
  PayPalPlansType,
  PayPalWebHookEventType,
  SubscriptionDetailsType,
  WHPaymentSaleType,
} from '../../../../../common/adapters/types/paypal/types';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { PaymentsRepository } from '../../../infrastructure/payments.repository';
import { Subscription } from '@prisma/payments';
import {
  SubscriptionStatuses,
  TransactionStatuses,
} from '../../../../../common/enum/transaction-statuses.enum';
import {
  PaymentSystem,
  SubscriptionType,
} from '../../../../../../../../libs/common/enums/payments';
import {
  TransactionEntity,
  TransactionInputDto,
} from '../../../domain/transaction.entity';
import { PayPalAdapter } from '../../../../../common/adapters/paypal.adapter';
import {
  SubscriptionEntity,
  SubscriptionUpdateDto,
} from '../../../domain/subscription.entity';
import { LoggerService } from '@app/logger';

@Injectable()
export class PayPalPaymentSucceededHandler
  implements IPayPalEventHandler<PayPalWebHookEventType<WHPaymentSaleType>>
{
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly appNotification: ApplicationNotification,
    @Inject(TransactionEntity.name)
    private readonly transactionEntity: typeof TransactionEntity,
    @Inject(SubscriptionEntity.name)
    private readonly subscriptionEntity: typeof SubscriptionEntity,
    private readonly payPalAdapter: PayPalAdapter,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PayPalPaymentSucceededHandler.name);
  }

  // TODO С блокировкой сделать чтобы небыло расхожденией по различным ивентам которые приходят
  async handle(
    event: PayPalWebHookEventType<WHPaymentSaleType>,
  ): Promise<AppNotificationResultType<null>> {
    try {
      this.logger.debug('Execute: payment succeeded', this.handle.name);
      const { billing_agreement_id, custom, create_time } = event.resource;

      const subscription: Subscription | null =
        await this.paymentsRepository.getSubscriptionByPaymentSystemSubId(
          billing_agreement_id,
        );

      if (!subscription) return this.appNotification.notFound();

      const subscriptionDetails: SubscriptionDetailsType =
        await this.payPalAdapter.getSubscriptionDetails(
          subscription.paymentSystemSubId,
        );

      if (!subscriptionDetails)
        return this.appNotification.internalServerError();

      const currentSubscription: Subscription | null =
        await this.paymentsRepository.getActiveSubscriptionByUserId(custom);

      if (currentSubscription && currentSubscription.isActive) {
        await this.payPalAdapter.cancelSubscription(
          currentSubscription.paymentSystemSubId,
        );
        this.subscriptionEntity.unActiveSubscription(currentSubscription);
        await this.paymentsRepository.updateSub(currentSubscription);
      }

      const subscriptionUpdateData: SubscriptionUpdateDto =
        this.generateDataUpdateSubscription(
          custom,
          create_time,
          subscriptionDetails.billing_info.next_billing_time,
        );

      const handleCurrentPlan: PayPalPlansType = await this.handlePlan(
        subscriptionDetails.plan_id,
      );

      const transactionData: TransactionInputDto = this.generateDataTransaction(
        Number(event.resource.amount.total),
        subscription.id,
        handleCurrentPlan.name as SubscriptionType,
        create_time,
        subscriptionDetails.billing_info.next_billing_time,
      );
      const transaction: TransactionEntity =
        this.transactionEntity.create(transactionData);

      this.subscriptionEntity.update(subscription, subscriptionUpdateData);

      await this.paymentsRepository.updateSub(subscription);
      await this.paymentsRepository.saveTransaction(transaction);

      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.handle.name);
      return this.appNotification.internalServerError();
    }
  }

  private generateDataTransaction(
    price: number,
    subId: string,
    subType: SubscriptionType,
    dateOfPayment: Date,
    endDateOfSubscription: Date,
  ): TransactionInputDto {
    return {
      price: price,
      system: PaymentSystem.PAYPAL,
      subscriptionType: subType,
      status: TransactionStatuses.PaymentSucceeded,
      subId: subId,
      dateOfPayment: dateOfPayment,
      endDateOfSubscription: endDateOfSubscription,
    };
  }

  private generateDataUpdateSubscription(
    customerId: string,
    dateOfPayment: Date,
    endDateOfSubscription: Date,
  ): SubscriptionUpdateDto {
    return {
      updatedAt: new Date(),
      dateOfPayment: dateOfPayment,
      endDateOfSubscription: endDateOfSubscription,
      paymentSystemCustomerId: customerId,
      status: SubscriptionStatuses.Active,
      isActive: true,
    };
  }

  private async handlePlan(planId: string): Promise<PayPalPlansType> {
    const plans: PayPalPlansResponseType = await this.payPalAdapter.getPlans();
    return plans.plans.find((p: PayPalPlansType): boolean => p.id === planId);
  }
}
