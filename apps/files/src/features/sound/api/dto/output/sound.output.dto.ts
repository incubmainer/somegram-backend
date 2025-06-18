import { Sound } from '../../../models/sound-model';

export class SoundOutputDto {
  url: string;
  ownerId: string;
  size: number;
  messageId: string;
  chatId: string;
  duration: number;
  key: string;

  constructor(url: string, sound: Sound) {
    const { messageId, chatId, size, duration, ownerId, key } = sound;
    this.url = url;
    this.size = size;
    this.messageId = messageId;
    this.chatId = chatId;
    this.duration = duration;
    this.key = key;
    this.ownerId = ownerId;
  }
}
