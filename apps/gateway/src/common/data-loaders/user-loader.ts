import * as DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import { NestDataLoader } from 'nestjs-dataloader';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';

import { QueryBus } from '@nestjs/cqrs';
import { GetUsersByIdsQuery } from '../../features/users/application/queryBus/graphql/get-users-by-ids.use-case';
import { UserModel } from '../../features/resolvers/users/models/user.model';

@Injectable()
export class UserLoader implements NestDataLoader<string, UserModel | null> {
  constructor(private readonly queryBus: QueryBus) {}

  generateDataLoader(): DataLoader<string, UserModel | null> {
    const batchLoadFn: DataLoader.BatchLoadFn<
      string,
      UserModel | null
    > = async (userIds: string[]) => {
      const result: AppNotificationResultType<UserModel[]> =
        await this.queryBus.execute(new GetUsersByIdsQuery(userIds));

      if (result.appResult === AppNotificationResultEnum.Success) {
        const usersMap = new Map<string, UserModel>();

        result.data.forEach((user) => usersMap.set(user.id, user));

        return userIds.map((userId) => usersMap.get(userId) || null);
      } else {
        return userIds.map(() => null);
      }
    };

    return new DataLoader(batchLoadFn);
  }
}
