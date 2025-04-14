import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import {
  PrismaClient as PaymentsPrismaClient,
  Subscription,
  PaymentTransaction,
} from '@prisma/payments';
import { TransactionEntity } from '../domain/transaction.entity';
import { SearchQueryParameters } from '../../../../../gateway/src/common/domain/query.types';
import { LoggerService } from '@app/logger';
import { SubscriptionStatuses } from '../../../common/enum/subscription-types.enum';

@Injectable()
export class PaymentsRepository {
  private readonly TRANSACTION_TIMEOUT: number = 50000;
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PaymentsPrismaClient>
    >,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PaymentsRepository.name);
  }

  public async getPaymentsByUserId(
    userId: string,
    queryString: SearchQueryParameters,
  ) {
    const { pageSize, pageNumber } = queryString;

    const skip = (pageNumber - 1) * pageSize;
    const payments = await this.txHost.tx.paymentTransaction.findMany({
      where: {
        subscription: {
          userId,
        },
      },
      orderBy: {
        dateOfPayment: 'desc',
      },
      take: pageSize,
      skip: skip,
    });

    const count = await this.txHost.tx.paymentTransaction.count({
      where: {
        subscription: {
          userId,
        },
      },
    });

    return { payments, count };
  }

  public async saveTransaction(
    transaction: TransactionEntity,
  ): Promise<string> {
    this.logger.debug('Execute: create transaction', this.saveTransaction.name);
    const result: PaymentTransaction =
      await this.txHost.tx.paymentTransaction.create({
        data: transaction,
      });
    return result.id;
  }

  public async createSub(subscription: Subscription): Promise<string> {
    this.logger.debug('Execute: create subscription', this.createSub.name);
    const newSubscription: Subscription =
      await this.txHost.tx.subscription.create({
        data: subscription,
      });
    return newSubscription.id;
  }

  public async updateSub(subscription: Subscription): Promise<string> {
    this.logger.debug('Execute: update subscription', this.updateSub.name);
    const result: Subscription = await this.txHost.tx.subscription.update({
      data: subscription,
      where: { id: subscription.id },
    });
    return result.id;
  }

  public async updateManySub(subscriptions: Subscription[]): Promise<void> {
    this.logger.debug(
      'Execute: update many subscriptions',
      this.updateManySub.name,
    );
    await this.txHost.withTransaction(
      { timeout: this.TRANSACTION_TIMEOUT },
      async (): Promise<void> => {
        const promises = subscriptions.map((subscription: Subscription) => {
          return this.txHost.tx.subscription.update({
            where: { id: subscription.id },
            data: subscription,
          });
        });

        await Promise.all(promises);
      },
    );
  }

  public async getSubscriptionByPaymentSystemSubId(
    paymentSystemSubId: string,
  ): Promise<Subscription | null> {
    this.logger.debug(
      'Execute: get subscription by system subscription id',
      this.getSubscriptionByPaymentSystemSubId.name,
    );
    const subscription = await this.txHost.tx.subscription.findFirst({
      where: { paymentSystemSubId: paymentSystemSubId },
    });
    return subscription ? subscription : null;
  }

  public async getSubscriptionById(id: string): Promise<Subscription | null> {
    this.logger.debug(
      'Execute: get subscription by id',
      this.getSubscriptionById.name,
    );
    const subscription = await this.txHost.tx.subscription.findFirst({
      where: { id },
    });
    return subscription ? subscription : null;
  }

  public async getActiveSubscriptionsByDate(
    date: Date,
  ): Promise<Subscription[] | null> {
    this.logger.debug(
      'Execute: get active subscription by date',
      this.getActiveSubscriptionsByDate.name,
    );
    const subscriptions = await this.txHost.tx.subscription.findMany({
      where: {
        OR: [
          { status: SubscriptionStatuses.Active },
          { status: SubscriptionStatuses.Suspended },
        ],
        endDateOfSubscription: {
          lt: date,
        },
      },
    });
    return subscriptions && subscriptions.length > 0 ? subscriptions : null;
  }

  public async getActiveSubscriptionByUserId(
    userId: string,
  ): Promise<Subscription | null> {
    this.logger.debug(
      'Execute: get active subscription by user id',
      this.getActiveSubscriptionByUserId.name,
    );
    const subscription = await this.txHost.tx.subscription.findFirst({
      where: {
        OR: [
          { status: SubscriptionStatuses.Active },
          { status: SubscriptionStatuses.Suspended },
        ],
        userId,
      },
    });
    return subscription ? subscription : null;
  }

  public async updateSubscription(subscription: Subscription): Promise<string> {
    const result: Subscription = await this.txHost.tx.subscription.update({
      data: {
        updatedAt: new Date(),
        paymentSystemSubId: subscription.paymentSystemSubId,
        status: subscription.status,
        autoRenewal: subscription.autoRenewal,
        paymentSystemCustomerId: subscription.paymentSystemCustomerId,
      },
      where: {
        id: subscription.id,
      },
    });
    return result.id;
  }

  public async testingDeletePayments(userId: string) {
    this.logger.debug(
      'Execute: update subscription',
      this.testingDeletePayments.name,
    );
    return await this.txHost.tx.paymentTransaction.deleteMany({
      where: {
        subscription: {
          userId: userId,
        },
      },
    });
  }

  public async getActiveSubscriptions(): Promise<Subscription[] | null> {
    this.logger.debug(
      'Execute: get active subscriptions',
      this.getActiveSubscriptions.name,
    );
    const subscriptions = await this.txHost.tx.subscription.findMany({
      where: {
        OR: [
          { status: SubscriptionStatuses.Active },
          { status: SubscriptionStatuses.Suspended },
        ],
      },
    });
    return subscriptions && subscriptions.length > 0 ? subscriptions : null;
  }
}
