import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import {
  PrismaClient as PaymentsPrismaClient,
  Subscription,
  PaymentTransaction,
} from '@prisma/payments';

import { SubscriptionStatuses } from '../../../common/enum/transaction-statuses.enum';
import { TransactionEntity } from '../domain/transaction.entity';
import { SearchQueryParametersType } from '../../../../../gateway/src/common/domain/query.types';
import { LoggerService } from '@app/logger';

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
    queryString: SearchQueryParametersType,
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

  public async getActiveSubscriptionByUserId(userId: string): Promise<
    {
      payments: PaymentTransaction[];
    } & Subscription
  > {
    const subscription = await this.txHost.tx.subscription.findFirst({
      where: {
        OR: [
          { status: SubscriptionStatuses.Active },
          { status: SubscriptionStatuses.Suspended },
        ],
        userId,
        isActive: true,
      },
      include: {
        payments: {
          orderBy: {
            dateOfPayment: 'desc',
          },
          take: 1,
        },
      },
    });
    return subscription ? subscription : null;
  }
  public async saveTransaction(
    transaction: TransactionEntity,
  ): Promise<string> {
    const result: PaymentTransaction =
      await this.txHost.tx.paymentTransaction.create({
        data: transaction,
      });
    return result.id;
  }

  public async createSub(subscription: Subscription): Promise<string> {
    const newSubscription: Subscription =
      await this.txHost.tx.subscription.create({
        data: subscription,
      });
    return newSubscription.id;
  }

  public async updateSub(subscription: Subscription): Promise<string> {
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

  public async getActiveOrPendingOrSuspendSubscriptionByUserId(
    userId: string,
  ): Promise<Subscription | null> {
    const subscriptions = await this.txHost.tx.subscription.findFirst({
      where: {
        userId,
        OR: [
          { status: SubscriptionStatuses.Active },
          { status: SubscriptionStatuses.Pending },
          { status: SubscriptionStatuses.Suspended },
        ],
        isActive: true,
      },
    });
    return subscriptions ? subscriptions : null;
  }

  public async getSubscriptionById(id: string): Promise<Subscription | null> {
    const subscription = await this.txHost.tx.subscription.findFirst({
      where: { id },
    });
    return subscription ? subscription : null;
  }

  public async getSubscriptionByStatusAndDate(
    date: Date,
  ): Promise<Subscription[] | null> {
    const subscriptions = await this.txHost.tx.subscription.findMany({
      where: {
        OR: [
          { status: SubscriptionStatuses.Active },
          { status: SubscriptionStatuses.Pending },
          { status: SubscriptionStatuses.Suspended },
          { isActive: true },
        ],
        endDateOfSubscription: {
          lt: date,
        },
      },
    });
    return subscriptions && subscriptions.length > 0 ? subscriptions : null;
  }

  public async activeSubscriptionByUserId(
    userId: string,
  ): Promise<Subscription> {
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
}
