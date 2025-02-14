import * as DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import { NestDataLoader } from 'nestjs-dataloader';

import { FileModel } from '../../resolvers/users/models/file-model';
import { PhotoServiceAdapter } from '../adapter/photo-service.adapter';

@Injectable()
export class UserAvatarsLoader
  implements NestDataLoader<string, FileModel | null>
{
  constructor(private readonly photoServiceAdapter: PhotoServiceAdapter) {}

  generateDataLoader(): DataLoader<string, FileModel | null> {
    const batchLoadFn: DataLoader.BatchLoadFn<
      string,
      FileModel | null
    > = async (userIds: string[]): Promise<(FileModel | null)[]> => {
      const avatarsData =
        await this.photoServiceAdapter.getUsersAvatar(userIds);

      if (!avatarsData) {
        return userIds.map(() => null);
      }
      return userIds.map((userId) => {
        return avatarsData.find((avatar) => avatar.ownerId === userId) || null;
      });
    };
    return new DataLoader(batchLoadFn);
  }
}
