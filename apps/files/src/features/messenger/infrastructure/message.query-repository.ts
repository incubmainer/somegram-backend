import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from '../models/message-model';

@Injectable()
export class MessageQueryRepository {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
  ) {}

  async getMessageByMessageId(messageId: string): Promise<Message> {
    return this.messageModel.findOne({ messageId });
  }
}
