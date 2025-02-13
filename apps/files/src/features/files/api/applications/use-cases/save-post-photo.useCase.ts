import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as sharp from 'sharp';

import { FileDto } from '../../../../../../../gateway/src/features/posts/api/dto/input-dto/add-post.dto';
import { S3Adapter } from '../../../../../common/application/adapters/s3.adapter';
import { PhotosRepository } from '../../../infrastructure/photos.repository';
import { PhotosQueryRepository } from '../../../infrastructure/photos.query.repository';
import { IPostPhoto } from '../../../../../common/ts/interfaces/post-photo.interface';

export class SavePostPhotoCommand {
  constructor(
    public payload: { ownerId: string; postId: string; file: FileDto },
  ) {}
}

@CommandHandler(SavePostPhotoCommand)
export class SavePostPhotoUseCase
  implements ICommandHandler<SavePostPhotoCommand>
{
  constructor(
    private readonly s3Adapter: S3Adapter,
    private readonly photosRepository: PhotosRepository,
    private readonly photosQueryRepository: PhotosQueryRepository,
  ) {}

  async execute({ payload }: SavePostPhotoCommand) {
    try {
      const postPhoto = await this.s3Adapter.savePostPhoto(
        payload.ownerId,
        payload.postId,
        payload.file,
      );
      const extractedBuffer = Buffer.from(payload.file.buffer);
      const metadata = await sharp(extractedBuffer).metadata();

      const newPostPhotoInfo: IPostPhoto = {
        ownerId: payload.ownerId,
        postId: payload.postId,
        originalname: payload.file.originalname,
        key: postPhoto.key,
        size: payload.file.size,
        createdAt: new Date(),
        height: metadata.height,
        width: metadata.width,
      };

      await this.photosRepository.addPostPhoto(newPostPhotoInfo);
      const postPhotos = await this.photosQueryRepository.findPostPhotos(
        payload.postId,
      );

      return postPhotos;
    } catch (e) {
      throw e;
    }
  }
}
