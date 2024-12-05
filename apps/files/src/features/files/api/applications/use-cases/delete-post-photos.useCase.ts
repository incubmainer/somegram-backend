import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { S3Adapter } from '../../../../../common/application/adapters/s3.adapter';
import { PhotosRepository } from '../../../infrastructure/photos.repository';
import { PhotosQueryRepository } from '../../../infrastructure/photos.query.repopository';

export class DeletePostPhotosCommand {
  constructor(public payload: { postId: string }) {}
}

@CommandHandler(DeletePostPhotosCommand)
export class DeletePostPhotosUseCase
  implements ICommandHandler<DeletePostPhotosCommand>
{
  constructor(
    private readonly s3Adapter: S3Adapter,
    private readonly photosRepository: PhotosRepository,
    private readonly photosQueryRepository: PhotosQueryRepository,
  ) {}

  async execute({ payload }: DeletePostPhotosCommand) {
    try {
      const postPhotos = await this.photosQueryRepository.findPostPhotos(
        payload.postId,
      );
      if (postPhotos.length === 0) return null;
      postPhotos.map(async (post) => {
        await this.s3Adapter.deleteImage(post.key);
      });
      return await this.photosRepository.deleteAllPostPhotos(payload.postId);
    } catch (e) {
      throw e;
    }
  }
}
