import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as sharp from 'sharp';

import { FileDto } from '../../../../../../../gateway/src/features/posts/api/dto/input-dto/add-post.dto';
import { S3Adapter } from '../../../../../common/application/adapters/s3.adapter';
import { PhotosRepository } from '../../../infrastructure/photos.repository';
import { IAvatar } from '../../../../../common/ts/interfaces/avatar.interface';
import { PhotosQueryRepository } from '../../../infrastructure/photos.query.repopository';

export class UploadAvatarCommand {
  constructor(public payload: { ownerId: string; file: FileDto }) {}
}

@CommandHandler(UploadAvatarCommand)
export class UploadAvatarUseCase
  implements ICommandHandler<UploadAvatarCommand>
{
  constructor(
    private readonly s3Adapter: S3Adapter,
    private readonly photosRepository: PhotosRepository,
    private readonly photosQueryRepository: PhotosQueryRepository,
  ) {}

  async execute({ payload }: UploadAvatarCommand) {
    try {
      const oldAvatar = await this.photosQueryRepository.findAvatar(
        payload.ownerId,
      );
      if (oldAvatar) {
        await this.s3Adapter.deleteImage(oldAvatar.key);
        await this.photosRepository.deleteAvatar(payload.ownerId);
      }

      const avatar = await this.s3Adapter.saveAvatar(
        payload.ownerId,
        payload.file,
      );
      const extractedBuffer = Buffer.from(payload.file.buffer);
      const metadata = await sharp(extractedBuffer).metadata();

      const newAvatarInfo: IAvatar = {
        ownerId: payload.ownerId,
        originalname: payload.file.originalname,
        key: avatar.key,
        size: payload.file.size,
        createdAt: new Date(),
        height: metadata.height,
        width: metadata.width,
      };

      const avatarInfo = await this.photosRepository.addAvatar(newAvatarInfo);

      return await this.s3Adapter.getFileUrl(avatarInfo.key);
    } catch (e) {
      throw e;
    }
  }
}
