import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sound } from '../models/sound-model';
import { ISound } from '../models/types';

@Injectable()
export class SoundRepository {
  constructor(
    @InjectModel(Sound.name) private readonly soundModel: Model<Sound>,
  ) {}

  async create(sound: ISound): Promise<Sound> {
    const newSound = new this.soundModel(sound);
    return newSound.save();
  }

  async deleteByMessageId(messageId: string): Promise<void> {
    await this.soundModel.deleteOne({ messageId });
  }
}
