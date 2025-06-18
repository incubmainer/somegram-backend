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

  async execute(command: DeleteSoundCommand): Promise<null> {
    const { messagesIds } = command.payload;
    try {
      const messages = await this.soundRepository.getMessagesByIds(messagesIds);

      if (!messages) return null;

      await Promise.all([
        messages.map((m) => this.s3Adapter.deleteImage(m.key)),
        this.soundRepository.deleteByMessagesIds(messagesIds),
      ]);
      return null;
    } catch (e) {
      console.error('Delete sound error: ', e);
      return;
    }
  }
}
