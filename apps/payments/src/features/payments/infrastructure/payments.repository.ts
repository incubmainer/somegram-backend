import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import {
  PrismaClient as PaymentsPrismaClient,
  Order,
  PaymentTransaction,
} from '@prisma/payments';

@Injectable()
export class PaymentsRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PaymentsPrismaClient>
    >,
  ) {}
  public async createOrder(dto: {
    userId: Order['userId'];
    subscriptionType: Order['subscriptionType'];
    price: Order['price'];
    paymentCount: Order['paymentCount'];
    autoRenewal: Order['autoRenewal'];
  }) {
    return await this.txHost.tx.order.create({
      data: {
        price: dto.price,
        paymentCount: dto.paymentCount,
        userId: dto.userId,
        subscriptionType: dto.subscriptionType,
        createdAt: new Date(),
        autoRenewal: dto.autoRenewal,
      },
    });
  }

  public async createPaymentTransaction(dto: {
    price: PaymentTransaction['price'];
    paymentSystem: PaymentTransaction['paymentSystem'];
    status: PaymentTransaction['status'];
    orderId: PaymentTransaction['orderId'];
    createdAt: PaymentTransaction['createdAt'];
  }) {
    return await this.txHost.tx.paymentTransaction.create({
      data: {
        price: dto.price,
        paymentSystem: dto.paymentSystem,
        status: dto.status,
        createdAt: dto.createdAt,
        orderId: dto.orderId,
      },
    });
  }

  public async getOrderById(orderId: string) {
    const order = await this.txHost.tx.order.findUnique({
      where: { id: orderId },
    });
    return order ? order : null;
  }

  public async getOrderByPaymentSystemOrderId(paymentSystemOrderId: string) {
    const order = await this.txHost.tx.order.findFirst({
      where: { paymentSystemOrderId: paymentSystemOrderId },
    });
    return order ? order : null;
  }

  public async updateOrder(oder: Order) {
    return await this.txHost.tx.order.update({
      data: {
        dateOfPayment: oder.dateOfPayment,
        updatedAt: oder.updatedAt,
        endDateOfSubscription: oder.endDateOfSubscription,
        paymentSystemOrderId: oder.paymentSystemOrderId,
      },
      where: {
        id: oder.id,
      },
    });
  }
}
