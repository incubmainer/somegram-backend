import { Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';

import {
  PaymentSystem,
  SubscriptionType,
} from '../../../../../../../../libs/common/enums/payments';
import { TransactionStatuses } from '../../../../../common/enum/transaction-statuses.enum';
import { IStripeEventHandler } from '../../../../../common/interfaces/stripe-event-handler.interface';
import { PaymentsRepository } from '../../../infrastructure/payments.repository';
import {
  TransactionEntity,
  TransactionInputDto,
} from '../../../domain/transaction.entity';
import { SUBSCRIPTION_TYPE } from '../../../../../common/enum/subscription-types.enum';

@Injectable()
export class StripeInvoicePaymentFailedHandler implements IStripeEventHandler {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    @Inject(TransactionEntity.name)
    private readonly transactionEntity: typeof TransactionEntity,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
  ) {
    this.logger.setContext(StripeInvoicePaymentFailedHandler.name);
  }

  async handle(event: Stripe.Event): Promise<AppNotificationResultType<null>> {
    try {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription_details.metadata.subId;
      const subscription =
        await this.paymentsRepository.getSubscriptionById(subscriptionId);
      if (!subscription) {
        return this.appNotification.notFound();
      }
      subscription.dateOfPayment = new Date(invoice.period_start * 1000);
      subscription.endDateOfSubscription = new Date(invoice.period_end * 1000);
      await this.paymentsRepository.updateSub(subscription);

      const subscriptionData = invoice.lines.data[0];

      const transactionData: TransactionInputDto = this.generateDataTransaction(
        subscriptionData.amount,
        subscription.id,
        SUBSCRIPTION_TYPE[subscriptionData.plan.interval] as SubscriptionType,
        subscription.dateOfPayment,
        subscription.endDateOfSubscription,
      );
      const transaction: TransactionEntity =
        this.transactionEntity.create(transactionData);
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
    subscriptionType: SubscriptionType,
    dateOfPayment: Date,
    endDateOfSubscription: Date,
  ): TransactionInputDto {
    return {
      price: price,
      system: PaymentSystem.STRIPE,
      subscriptionType,
      status: TransactionStatuses.PaymentFailed,
      subId,
      dateOfPayment,
      endDateOfSubscription,
    };
  }
}
