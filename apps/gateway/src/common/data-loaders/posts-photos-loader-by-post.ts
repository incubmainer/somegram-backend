import * as DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import { NestDataLoader } from 'nestjs-dataloader';

import { PhotoServiceAdapter } from '../adapter/photo-service.adapter';
import { FileModel } from '../../features/resolvers/users/models/file-model';

@Injectable()
export class PostsPhotosLoaderByPost
  implements NestDataLoader<string, FileModel[] | null>
{
  constructor(private readonly photoServiceAdapter: PhotoServiceAdapter) {}

  generateDataLoader(): DataLoader<string, FileModel[] | null> {
    return new DataLoader<string, FileModel[] | null>(
      async (postIds: string[]) => {
        const filesData =
          await this.photoServiceAdapter.getPostsPhotos(postIds);

        const fileMap = new Map<string, FileModel[]>();

        filesData.forEach((file) => {
          if (!fileMap.has(file.postId)) {
            fileMap.set(file.postId, []);
          }
          fileMap.get(file.postId)!.push(file);
        });

        return postIds.map((postId) => fileMap.get(postId) || null);
      },
    );
  }
}
