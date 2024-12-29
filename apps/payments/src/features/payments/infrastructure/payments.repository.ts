import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import {
  PrismaClient as PaymentsPrismaClient,
  Subscription,
  PaymentTransaction,
} from '@prisma/payments';
import { SubscriptionStatuses } from '../../../common/enum/transaction-statuses.enum';
import { SearchQueryParametersType } from '../../../../../gateway/src/common/domain/query.types';

@Injectable()
export class PaymentsRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PaymentsPrismaClient>
    >,
  ) {}
  public async createSubscription(dto: {
    userId: Subscription['userId'];
    autoRenewal: Subscription['autoRenewal'];
    status: Subscription['status'];
    paymentSystem: Subscription['paymentSystem'];
    paymentSystemSubId: Subscription['paymentSystemSubId'];
    dateOfPayment?: Subscription['dateOfPayment'];
    endDateOfSubscription?: Subscription['endDateOfSubscription'];
    paymentSystemCustomerId?: Subscription['paymentSystemCustomerId'];
  }) {
    return await this.txHost.tx.subscription.create({
      data: {
        userId: dto.userId,
        status: dto.status,
        createdAt: new Date(),
        paymentSystem: dto.paymentSystem,
        autoRenewal: dto.autoRenewal,
        paymentSystemSubId: dto.paymentSystemSubId,
        endDateOfSubscription: dto.endDateOfSubscription,
        dateOfPayment: dto.dateOfPayment,
        paymentSystemCustomerId: dto.paymentSystemCustomerId,
      },
    });
  }

  public async createPaymentTransaction(dto: {
    price: PaymentTransaction['price'];
    paymentSystem: PaymentTransaction['paymentSystem'];
    subscriptionType: PaymentTransaction['subscriptionType'];
    status: PaymentTransaction['status'];
    subId: PaymentTransaction['subId'];
    dateOfPayment: PaymentTransaction['dateOfPayment'];
    endDateOfSubscription?: PaymentTransaction['endDateOfSubscription'];
  }) {
    return await this.txHost.tx.paymentTransaction.create({
      data: {
        price: dto.price,
        paymentSystem: dto.paymentSystem,
        status: dto.status,
        dateOfPayment: dto.dateOfPayment,
        subscriptionType: dto.subscriptionType,
        endDateOfSubscription: dto.endDateOfSubscription
          ? dto.endDateOfSubscription
          : null,
        subId: dto.subId,
      },
    });
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

  public async updateSubscription(
    subscription: Subscription,
  ): Promise<Subscription> {
    return await this.txHost.tx.subscription.update({
      data: {
        dateOfPayment: subscription.dateOfPayment,
        updatedAt: subscription.updatedAt,
        endDateOfSubscription: subscription.endDateOfSubscription,
        paymentSystemSubId: subscription.paymentSystemSubId,
        status: subscription.status,
        autoRenewal: subscription.autoRenewal,
        paymentSystemCustomerId: subscription.paymentSystemCustomerId,
      },
      where: {
        id: subscription.id,
      },
    });
  }
}
