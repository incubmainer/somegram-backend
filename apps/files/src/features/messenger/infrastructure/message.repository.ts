import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IMessage } from '../models/types';
import { Message } from '../models/message-model';

@Injectable()
export class MessageRepository {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
  ) {}

  async create(message: IMessage): Promise<Message> {
    const newMessage = new this.messageModel(message);
    return newMessage.save();
  }

  async deleteByMessagesIds(messagesIds: string[]): Promise<void> {
    await this.messageModel.deleteMany({ messageId: { $in: messagesIds } });
  }

  async getMessagesByIds(messagesIds: string[]): Promise<Message[] | null> {
    const messages = await this.messageModel.find({
      messageId: { $in: messagesIds },
    });

    return messages && messages.length > 0 ? messages : null;
  }
}
