import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteSoundInputDto } from '../../api/dto/input/delete-sound.input.dto';
import { S3Adapter } from '../../../../common/application/adapters/s3.adapter';
import { SoundRepository } from '../../infrastructure/sound.repository';

export class DeleteSoundCommand {
  constructor(public payload: DeleteSoundInputDto) {}
}

@CommandHandler(DeleteSoundCommand)
export class DeleteSoundUseCase implements ICommandHandler<DeleteSoundCommand> {
  constructor(
    private readonly s3Adapter: S3Adapter,
    private readonly soundRepository: SoundRepository,
  ) {}

  async execute(command: DeleteSoundCommand) {
    try {
      // const avatarInfo = await this.photosQueryRepository.findAvatar(
      //   payload.userId,
      // );
      // if (!avatarInfo) return null;
      // await this.s3Adapter.deleteImage(avatarInfo.key);
      // return await this.photosRepository.deleteAvatar(payload.userId);
    } catch (e) {
      console.error('Delete sound error: ', e);
      return null;
    }
  }
}
