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

      // Если нет подписок, возвращаем null для каждого userId
      if (!subscriptions) {
        return userIds.map(() => null);
      }

      // Создаем карту для хранения платежей по userId
      const paymentsMap = new Map<string, PaymentsModel[]>();

      // Обрабатываем каждую подписку и собираем платежи по userId
      subscriptions.forEach((subscription) => {
        const { userId, payments } = subscription;

        // Инициализируем массив для платежей, если его еще нет
        if (!paymentsMap.has(userId)) {
          paymentsMap.set(userId, []);
        }

        // Добавляем платежи к соответствующему userId
        paymentsMap.get(userId)!.push(...payments);
      });

      // Формируем ответ - массив платежей для каждого userId
      return userIds.map((userId) => {
        return paymentsMap.get(userId) || null; // Возвращаем массив платежей или null
      });
    };

    return new DataLoader(batchLoadFn); // Возвращаем DataLoader с batchLoadFn
  }
}
