import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Avatar } from '../models/avatar.model';
import { PostPhoto } from '../models/post-photo.model';

@Injectable()
export class PhotosQueryRepository {
  constructor(
    @InjectModel(PostPhoto.name)
    private readonly postPhotoModel: Model<PostPhoto>,
    @InjectModel(Avatar.name) private readonly avatarModel: Model<Avatar>,
  ) {}

  async findPostPhotos(postId: string): Promise<PostPhoto[] | null> {
    return this.postPhotoModel.find({ postId });
  }

  async findAvatar(ownerId: string): Promise<Avatar | null> {
    const avatar = await this.avatarModel.findOne({ ownerId });
    return avatar ? avatar : null;
  }

  async getUsersAvatar(ownerIds: string[]): Promise<Avatar[] | null> {
    const avatars = await this.avatarModel.find({ ownerId: { $in: ownerIds } });
    return avatars.length ? avatars : null;
  }
}
