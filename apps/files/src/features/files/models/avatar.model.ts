import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Avatar extends Document {
  @Prop({ required: true, unique: true })
  ownerId: string;

  @Prop({ required: true })
  originalname: string;

  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  height: number;

  @Prop({ required: true })
  width: number;

  @Prop({ required: true })
  size: number;

  @Prop({ required: false })
  createdAt: Date;
}

export const AvatarSchema = SchemaFactory.createForClass(Avatar);
