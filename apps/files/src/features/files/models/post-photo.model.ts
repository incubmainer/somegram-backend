import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class PostPhoto extends Document {
  @Prop({ required: true })
  ownerId: string;

  @Prop({ required: true })
  originalname: string;

  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  height: string;

  @Prop({ required: true })
  width: string;

  @Prop({ required: true })
  size: string;

  @Prop({ required: false })
  createdAt: Date;

  @Prop({ required: true })
  postId: string;
}

export const PostPhotoSchema = SchemaFactory.createForClass(PostPhoto);
