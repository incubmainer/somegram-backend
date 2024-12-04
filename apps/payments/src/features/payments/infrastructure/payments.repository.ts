import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import {
  PrismaClient as PaymentsPrismaClient,
  Subscription,
  PaymentTransaction,
} from '@prisma/payments';

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
    dateOfPayment: Subscription['dateOfPayment'];
    endDateOfSubscription?: Subscription['endDateOfSubscription'];
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

  public async getPaymentsByUserId(userId: string) {
    const subscriptionsWithPayments =
      await this.txHost.tx.subscription.findMany({
        where: { userId },
        include: {
          payments: true,
        },
      });

    const payments = subscriptionsWithPayments.flatMap(
      (subscription) => subscription.payments,
    );

    return payments.length > 0 ? payments : null;
  }

  public async getSubscriptionByUserId(userId: string) {
    const subscription = await this.txHost.tx.subscription.findFirst({
      where: { userId },
    });
    return subscription ? subscription : null;
  }

  public async getSubscriptionByPaymentSystemSubId(paymentSystemSubId: string) {
    const subscription = await this.txHost.tx.subscription.findFirst({
      where: { paymentSystemSubId: paymentSystemSubId },
    });
    return subscription ? subscription : null;
  }

  public async updateSubscription(subscription: Subscription) {
    return await this.txHost.tx.subscription.update({
      data: {
        dateOfPayment: subscription.dateOfPayment,
        updatedAt: subscription.updatedAt,
        endDateOfSubscription: subscription.endDateOfSubscription,
        paymentSystemSubId: subscription.paymentSystemSubId,
        status: subscription.status,
        autoRenewal: subscription.autoRenewal,
      },
      where: {
        id: subscription.id,
      },
    });
  }
}
