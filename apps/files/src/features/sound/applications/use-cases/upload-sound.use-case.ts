import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UploadSoundInputDto } from '../../api/dto/input/upload-sound.input.dto';
import { S3Adapter } from '../../../../common/application/adapters/s3.adapter';
import { SoundRepository } from '../../infrastructure/sound.repository';
import { ISound } from '../../models/types';
import { parseBuffer } from 'music-metadata';

export class UploadSoundCommand {
  constructor(public payload: UploadSoundInputDto) {}
}

@CommandHandler(UploadSoundCommand)
export class UploadSoundUseCase implements ICommandHandler<UploadSoundCommand> {
  constructor(
    private readonly s3Adapter: S3Adapter,
    private readonly soundRepository: SoundRepository,
  ) {}

  async execute(command: UploadSoundCommand) {
    const { payload } = command;
    const { messageId, message, chatId, ownerId, participantId } = payload;
    try {
      const sound = await this.s3Adapter.saveVoiceMessage(
        chatId,
        messageId,
        message,
      );

      const extractedBuffer = Buffer.from(message.buffer);

      const metadata = await parseBuffer(extractedBuffer, message.mimetype);

      const durationInSeconds = metadata.format.duration;

      const newSoundInfo: ISound = {
        ownerId,
        participantId,
        chatId: chatId,
        mimeType: message.mimetype,
        messageId: messageId,
        duration: durationInSeconds,
        key: sound.key,
        size: message.size,
        createdAt: new Date(),
      };

      const newSound = await this.soundRepository.create(newSoundInfo);
      return this.s3Adapter.getFileUrl(newSound.key);
    } catch (e) {
      console.error('Upload sound error: ', e);
      return null;
    }
  }
}
