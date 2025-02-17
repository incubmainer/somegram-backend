import * as DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import { NestDataLoader } from 'nestjs-dataloader';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';

import { UserModel } from '../../resolvers/users/models/user.model';
import { UsersService } from '../../features/users/application/users.service';

@Injectable()
export class UserLoader implements NestDataLoader<string, UserModel | null> {
  constructor(private readonly usersService: UsersService) {}

  generateDataLoader(): DataLoader<string, UserModel | null> {
    const batchLoadFn: DataLoader.BatchLoadFn<
      string,
      UserModel | null
    > = async (userIds: string[]) => {
      const result: AppNotificationResultType<UserModel[]> =
        await this.usersService.gerUsersByIds(userIds);

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
