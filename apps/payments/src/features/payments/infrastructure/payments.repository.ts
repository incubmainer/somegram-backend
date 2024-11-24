import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import {
  PrismaClient as PaymentsPrismaClient,
  Orders,
  PaymentTransactions,
} from '@prisma/payments';

@Injectable()
export class PaymentsRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PaymentsPrismaClient>
    >,
  ) {}
  public async createOrder(dto: {
    userId: Orders['userId'];
    subscriptionType: Orders['subscriptionType'];
    price: Orders['price'];
    paymentId: Orders['paymentId'];
  }) {
    return await this.txHost.tx.orders.create({
      data: {
        price: dto.price,
        userId: dto.userId,
        subscriptionType: dto.subscriptionType,
        paymentId: dto.paymentId,
        createdAt: new Date(),
      },
    });
  }

  public async createPaymentTransaction(dto: {
    price: PaymentTransactions['price'];
    paymentSystem: PaymentTransactions['paymentSystem'];
    status: PaymentTransactions['status'];
  }) {
    return await this.txHost.tx.paymentTransactions.create({
      data: {
        price: dto.price,
        paymentSystem: dto.paymentSystem,
        status: dto.status,
        createdAt: new Date(),
      },
    });
  }
}
