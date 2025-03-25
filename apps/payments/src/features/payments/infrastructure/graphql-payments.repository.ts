import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import {
  PrismaClient as PaymentsPrismaClient,
  Subscription,
} from '@prisma/payments';
import { SearchQueryParametersType } from '../../../../../gateway/src/common/domain/query.types';
import { LoggerService } from '@app/logger';
import { PaymentTransactionWithSubUserInfo } from '../application/types/payment-data.type';

@Injectable()
export class GraphqlPaymentsRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PaymentsPrismaClient>
    >,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GraphqlPaymentsRepository.name);
  }

  public async getPaymentsByUserId(
    userId: string,
    queryString: SearchQueryParametersType,
  ): Promise<{
    payments: PaymentTransactionWithSubUserInfo[];
    count: number;
  }> {
    this.logger.debug('Execute: get payments', this.getPaymentsByUserId.name);
    const { pageSize, pageNumber, sortBy, sortDirection } = queryString;

    const skip = (pageNumber - 1) * pageSize;
    const payments = await this.txHost.tx.paymentTransaction.findMany({
      where: {
        subscription: {
          userId,
        },
      },
      include: {
        subscription: {
          select: {
            userId: true,
            username: true,
          },
        },
      },
      orderBy: { [sortBy]: sortDirection },
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

  public async getSubscriptionsByUserIds(
    userIds: string[],
  ): Promise<Subscription[]> {
    this.logger.debug(
      'Execute: get subscriptions by users',
      this.getSubscriptionsByUserIds.name,
    );
    return this.txHost.tx.subscription.findMany({
      where: {
        userId: {
          in: userIds,
        },
      },
      include: {
        payments: true,
      },
    });
  }

  async getAllPayments(queryString: SearchQueryParametersType): Promise<{
    payments: PaymentTransactionWithSubUserInfo[];
    count: number;
  }> {
    this.logger.debug('Execute: get all payments', this.getAllPayments.name);
    const { pageSize, pageNumber, sortBy, sortDirection, search } = queryString;

    const skip = (pageNumber - 1) * pageSize;

    const where: any = {};
    if (search && search.trim() !== '') {
      where.subscription = {
        username: {
          contains: search,
          mode: 'insensitive',
        },
      };
    }

    const payments = await this.txHost.tx.paymentTransaction.findMany({
      where,
      include: {
        subscription: {
          select: {
            userId: true,
            username: true,
          },
        },
      },
      orderBy: { [sortBy]: sortDirection },
      take: pageSize,
      skip: skip,
    });

    const count = await this.txHost.tx.paymentTransaction.count({
      where,
    });

    return { payments, count };
  }
}
