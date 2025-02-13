import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { S3Adapter } from '../../../../../common/application/adapters/s3.adapter';
import { PhotosRepository } from '../../../infrastructure/photos.repository';
import { PhotosQueryRepository } from '../../../infrastructure/photos.query.repository';

export class DeleteAvatarCommand {
  constructor(public payload: { userId: string }) {}
}

@CommandHandler(DeleteAvatarCommand)
export class DeleteAvatarUseCase
  implements ICommandHandler<DeleteAvatarCommand>
{
  constructor(
    private readonly s3Adapter: S3Adapter,
    private readonly photosRepository: PhotosRepository,
    private readonly photosQueryRepository: PhotosQueryRepository,
  ) {}

  async execute({ payload }: DeleteAvatarCommand) {
    try {
      const avatarInfo = await this.photosQueryRepository.findAvatar(
        payload.userId,
      );
      if (!avatarInfo) return null;
      await this.s3Adapter.deleteImage(avatarInfo.key);
      return await this.photosRepository.deleteAvatar(payload.userId);
    } catch (e) {
      throw e;
    }
  }
}
