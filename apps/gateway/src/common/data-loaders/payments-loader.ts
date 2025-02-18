import * as DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import { NestDataLoader } from 'nestjs-dataloader';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';

import { PaymentsServiceAdapter } from '../adapter/payment-service.adapter';
import { PaymentsModel } from '../../resolvers/payments/models/payments.model';
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
      const result: AppNotificationResultType<any[]> =
        await this.paymentsServiceAdapter.getSubscriptionsByUserIds({
          userIds,
        });
      if (result.appResult === AppNotificationResultEnum.Success) {
        const paymentsMap = new Map<string, PaymentsModel[]>();

        result.data.forEach((subscription) => {
          const { userId, payments } = subscription;

          if (!paymentsMap.has(userId)) {
            paymentsMap.set(userId, []);
          }
          paymentsMap.get(userId)!.push(...payments);
        });

        return userIds.map((userId) => {
          return paymentsMap.get(userId) || null;
        });
      } else {
        return userIds.map(() => null);
      }
    };

    return new DataLoader(batchLoadFn);
  }
}
