import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { Sound, SoundSchema } from './models/sound-model';
import { SoundRepository } from './infrastructure/sound.repository';
import { UploadSoundUseCase } from './applications/use-cases/upload-sound.use-case';
import { DeleteSoundUseCase } from './applications/use-cases/delete-sound.use-case';
import { GetSoundQueryCase } from './applications/query-cases/get-sound.query-case';
import { SoundQueryRepository } from './infrastructure/sound.query-repository';
import { SoundController } from './api/sound.controller';
import { S3Adapter } from '../../common/application/adapters/s3.adapter';

const handlers = [UploadSoundUseCase, DeleteSoundUseCase];
const queryHandlers = [GetSoundQueryCase];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: Sound.name, schema: SoundSchema }]),
  ],
  controllers: [SoundController],
  providers: [
    SoundRepository,
    SoundQueryRepository,
    S3Adapter,
    ...queryHandlers,
    ...handlers,
  ],
})
export class SoundModule {}
