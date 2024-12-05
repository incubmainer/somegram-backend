import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Avatar } from '../models/avatar.model';
import { PostPhoto } from '../models/post-photomodel';

@Injectable()
export class PhotosQueryRepository {
  constructor(
    @InjectModel(PostPhoto.name)
    private readonly postPhotoModel: Model<PostPhoto>,
    @InjectModel(Avatar.name) private readonly avatarModel: Model<Avatar>,
  ) {}

  async findPostPhotos(postId: string) {
    return this.postPhotoModel.find({ postId });
  }

  async findAvatar(ownerId: string): Promise<Avatar | null> {
    const avatar = await this.avatarModel.findOne({ ownerId });
    return avatar ? avatar : null;
  }
}
