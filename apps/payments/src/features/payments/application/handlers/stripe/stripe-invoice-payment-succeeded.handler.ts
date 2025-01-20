import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { LoggerService } from '@app/logger';

import {
  PaymentSystem,
  SubscriptionType,
} from '../../../../../../../../libs/common/enums/payments';
import { GatewayServiceClientAdapter } from '../../../../../common/adapters/gateway-service-client.adapter';
import { TransactionStatuses } from '../../../../../common/enum/transaction-statuses.enum';
import { IStripeEventHandler } from '../../../../../common/interfaces/stripe-event-handler.interface';
import { PaymentsRepository } from '../../../infrastructure/payments.repository';

import {
  TransactionEntity,
  TransactionInputDto,
} from '../../../domain/transaction.entity';
//TODO app notification
@Injectable()
export class StripeInvoicePaymentSucceededHandler
  implements IStripeEventHandler
{
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly gatewayServiceClientAdapter: GatewayServiceClientAdapter,
    @Inject(TransactionEntity.name)
    private readonly transactionEntity: typeof TransactionEntity,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(StripeInvoicePaymentSucceededHandler.name);
  }

  async handle(event: Stripe.Event): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = invoice.subscription as string;

    const subscription =
      await this.paymentsRepository.getSubscriptionByPaymentSystemSubId(
        subscriptionId,
      );
    if (!subscription) {
      throw new BadRequestException('Webhook Error: Subscription not found');
    }
    const subscriptionData = invoice.lines.data[0];

    subscription.dateOfPayment = new Date(subscriptionData.period.start * 1000);
    subscription.endDateOfSubscription = new Date(
      subscriptionData.period.end * 1000,
    );

    await this.paymentsRepository.updateSub(subscription);

    // TODO: В 3 кейсах может упасть найти где именно. [Nest] 12766  - 01/20/2025, 5:31:59 PM   ERROR [StripeWebhookUseCase] TypeError: Cannot read properties of null (reading 'userId')
    this.gatewayServiceClientAdapter.sendSubscriptionInfo({
      userId: subscription.userId,
      endDateOfSubscription: subscription.endDateOfSubscription,
    });

    const transactionData: TransactionInputDto = this.generateDataTransaction(
      subscriptionData.amount,
      subscription.id,
      subscriptionData.plan.interval as SubscriptionType,
      subscription.dateOfPayment,
      subscription.endDateOfSubscription,
    );
    const transaction: TransactionEntity =
      this.transactionEntity.create(transactionData);

    await this.paymentsRepository.saveTransaction(transaction);
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
      status: TransactionStatuses.PaymentSucceeded,
      subId,
      dateOfPayment,
      endDateOfSubscription,
    };
  }
}
