import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetSoundInputDto } from '../../api/dto/input/get-sound.input.dto';
import { SoundQueryRepository } from '../../infrastructure/sound.query-repository';
import { S3Adapter } from '../../../../common/application/adapters/s3.adapter';
import { SoundOutputDto } from '../../api/dto/output/sound.output.dto';

export class GetSoundQuery {
  constructor(public payload: GetSoundInputDto) {}
}

@QueryHandler(GetSoundQuery)
export class GetSoundQueryCase implements IQueryHandler<GetSoundQuery> {
  constructor(
    private readonly soundQueryRepository: SoundQueryRepository,
    private readonly s3Adapter: S3Adapter,
  ) {}

  async execute(query: GetSoundQuery): Promise<SoundOutputDto | null> {
    const { messageId } = query.payload;
    try {
      const sound =
        await this.soundQueryRepository.getSoundByMessageId(messageId);

      if (!sound) return null;

      const soundUrl = this.s3Adapter.getFileUrl(sound.key);
      return new SoundOutputDto(soundUrl, sound);
    } catch (e) {
      console.error('Get sound error', e);
      return null;
    }
  }
}
