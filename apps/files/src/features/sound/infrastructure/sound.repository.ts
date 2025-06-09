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

  async deleteByMessagesIds(messagesIds: string[]): Promise<void> {
    await this.soundModel.deleteMany({ messageId: { $in: messagesIds } });
  }

  async getMessagesByIds(messagesIds: string[]): Promise<Sound[] | null> {
    const messages = await this.soundModel.find({
      messageId: { $in: messagesIds },
    });

    return messages && messages.length > 0 ? messages : null;
  }
}
