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

@Injectable()
export class PaymentsRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PaymentsPrismaClient>
    >,
  ) {}

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
      where: { userId, status: SubscriptionStatuses.Active },
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

  public async getSubscriptionByPaymentSystemSubId(paymentSystemSubId: string) {
    const subscription = await this.txHost.tx.subscription.findFirst({
      where: { paymentSystemSubId: paymentSystemSubId },
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

  public async getActiveOrPendingPaymentSystemSubscriptionByUserId(
    userId: string,
  ): Promise<Subscription | null> {
    const subscriptions = await this.txHost.tx.subscription.findFirst({
      where: {
        userId,
        OR: [
          { status: SubscriptionStatuses.Active },
          { status: SubscriptionStatuses.Pending },
        ],
        isActive: true,
      },
    });
    return subscriptions ? subscriptions : null;
  }

  public async getSubscriptionById(id: string) {
    const subscription = await this.txHost.tx.subscription.findFirst({
      where: { id },
    });
    return subscription ? subscription : null;
  }
}
