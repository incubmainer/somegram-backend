import * as DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import { NestDataLoader } from 'nestjs-dataloader';

import { FileModel } from '../../resolvers/users/models/file-model';
import { PhotoServiceAdapter } from '../adapter/photo-service.adapter';

@Injectable()
export class PostsPhotosLoader
  implements NestDataLoader<string, FileModel[] | null>
{
  constructor(private readonly photoServiceAdapter: PhotoServiceAdapter) {}

  generateDataLoader(): DataLoader<string, FileModel[] | null> {
    const batchLoadFn: DataLoader.BatchLoadFn<
      string,
      FileModel[] | null
    > = async (userIds: string[]) => {
      const filesData =
        await this.photoServiceAdapter.getPostsPhotosByOwnerId(userIds);
      if (!filesData) {
        return userIds.map(() => null); // Если данные не получены, возвращаем null
      }

      const fileMap = new Map<string, FileModel[]>(); // Изменяем на массивы

      // Предполагается, что filesData - массив объектов FileModel с полем postId
      filesData.forEach((file) => {
        if (!fileMap.has(file.ownerId)) {
          fileMap.set(file.ownerId, []);
        }
        fileMap.get(file.ownerId)!.push(file); // Добавляем файл в массив
      });

      // Формируем ответ - массив файлов для каждого postId
      return userIds.map((userId) => {
        return fileMap.get(userId) || null; // Возвращаем массив файлов или null
      });
    };

    return new DataLoader(batchLoadFn); // Возвращаем DataLoader с batchLoadFn
  }
}
