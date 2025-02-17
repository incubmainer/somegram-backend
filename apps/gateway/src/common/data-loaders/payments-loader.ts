import * as DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import { NestDataLoader } from 'nestjs-dataloader';

import { PaymentsServiceAdapter } from '../adapter/payment-service.adapter';
import { PaymentsModel } from '../../resolvers/payments/models/subscription.payments.model';
@Injectable()
export class PaymentsLoader
  implements NestDataLoader<string, PaymentsModel[] | null>
{
  constructor(
    private readonly paymentsServiceAdapter: PaymentsServiceAdapter,
  ) {}

  generateDataLoader(): DataLoader<string, PaymentsModel[] | null> {
    const batchLoadFn: DataLoader.BatchLoadFn<
      string,
      PaymentsModel[] | null
    > = async (userIds: string[]) => {
      const subscriptions =
        await this.paymentsServiceAdapter.getSubscriptionsByUserIds({
          userIds,
        });
      if (!subscriptions) {
        return userIds.map(() => null);
      }

      const paymentsMap = new Map<string, PaymentsModel[]>();

      subscriptions.forEach((subscription) => {
        const { userId, payments } = subscription;

        if (!paymentsMap.has(userId)) {
          paymentsMap.set(userId, []);
        }
        paymentsMap.get(userId)!.push(...payments);
      });

      return userIds.map((userId) => {
        return paymentsMap.get(userId) || null;
      });
    };

    return new DataLoader(batchLoadFn);
  }
}
