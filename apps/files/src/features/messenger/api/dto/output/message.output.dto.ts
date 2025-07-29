import { Message } from '../../../models/message-model';

export class MessageOutputDto {
  url: string;
  ownerId: string;
  size: number;
  messageId: string;
  chatId: string;
  duration: number;
  key: string;

  constructor(url: string, message: Message) {
    const { messageId, chatId, size, duration, ownerId, key } = message;
    this.url = url;
    this.size = size;
    this.messageId = messageId;
    this.chatId = chatId;
    this.duration = duration;
    this.key = key;
    this.ownerId = ownerId;
  }
}
