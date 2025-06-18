import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sound } from '../models/sound-model';

@Injectable()
export class SoundQueryRepository {
  constructor(
    @InjectModel(Sound.name) private readonly soundModel: Model<Sound>,
  ) {}

  async getSoundByMessageId(messageId: string): Promise<Sound> {
    return this.soundModel.findOne({ messageId });
  }
}
