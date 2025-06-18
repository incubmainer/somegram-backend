import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Sound extends Document {
  @Prop({ required: true })
  ownerId: string;

  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  duration: number; // Second

  @Prop({ required: false })
  createdAt: Date;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  messageId: string;

  @Prop({ required: true })
  chatId: string;
}

export const SoundSchema = SchemaFactory.createForClass(Sound);
