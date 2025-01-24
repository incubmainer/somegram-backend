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
import { TransactionStatuses } from '../../../../../common/enum/transaction-statuses.enum';
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
import { PaymentService } from '../../payments.service';
import { GatewayServiceClientAdapter } from '../../../../../common/adapters/gateway-service-client.adapter';
import { SubscriptionStatuses } from '../../../../../common/enum/subscription-types.enum';

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
    private readonly paymentService: PaymentService,
    private readonly gatewayServiceClientAdapter: GatewayServiceClientAdapter,
  ) {
    this.logger.setContext(PayPalPaymentSucceededHandler.name);
  }

  // TODO Блокировка
  async handle(
    event: PayPalWebHookEventType<WHPaymentSaleType>,
  ): Promise<AppNotificationResultType<null>> {
    try {
      this.logger.debug('Execute: payment paypal succeeded', this.handle.name);
      const { billing_agreement_id, custom, create_time } = event.resource;
      const currentDate: Date = new Date();

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

      await this.paymentService.handleActiveSubscription(
        custom,
        subscription.id,
      );

      const handleCurrentPlan: PayPalPlansType = await this.handlePlan(
        subscriptionDetails.plan_id,
      );
      const planName = handleCurrentPlan.name.toUpperCase() as SubscriptionType;

      const dateEnd: Date = this.paymentService.handleDateEnd(
        currentDate,
        planName,
      );

      const subscriptionUpdateData: SubscriptionUpdateDto =
        this.generateDataUpdateSubscription(custom, create_time, dateEnd);

      const transactionData: TransactionInputDto = this.generateDataTransaction(
        Number(event.resource.amount.total),
        subscription.id,
        planName,
        currentDate,
        dateEnd,
      );
      const transaction: TransactionEntity =
        this.transactionEntity.create(transactionData);

      this.subscriptionEntity.update(subscription, subscriptionUpdateData);

      await this.paymentsRepository.updateSub(subscription);
      await this.paymentsRepository.saveTransaction(transaction);

      this.gatewayServiceClientAdapter.sendSubscriptionInfo({
        userId: subscription.userId,
        endDateOfSubscription: dateEnd,
      });
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
    };
  }

  private async handlePlan(planId: string): Promise<PayPalPlansType> {
    const plans: PayPalPlansResponseType = await this.payPalAdapter.getPlans();
    return plans.plans.find((p: PayPalPlansType): boolean => p.id === planId);
  }
}
