import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Message extends Document {
  @Prop({ required: true })
  ownerId: string;

  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: false, nullable: true, default: null })
  duration: number | null; // Second

  @Prop({ required: false })
  createdAt: Date;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  messageId: string;

  @Prop({ required: true })
  chatId: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
