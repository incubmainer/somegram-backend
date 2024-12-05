import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Avatar } from '../models/avatar.model';
import { PostPhoto } from '../models/post-photomodel';
import { IAvatar } from '../../../common/ts/interfaces/avatar.interface';
import { IPostPhoto } from '../../../common/ts/interfaces/post-photo.interface';

@Injectable()
export class PhotosRepository {
  constructor(
    @InjectModel(PostPhoto.name)
    private readonly postPhotoModel: Model<PostPhoto>,
    @InjectModel(Avatar.name) private readonly avatarModel: Model<Avatar>,
  ) {}

  async addPostPhoto(photo: IPostPhoto) {
    const newPhoto = new this.postPhotoModel(photo);
    return newPhoto.save();
  }

  async addAvatar(avatar: IAvatar) {
    const newAvatar = new this.avatarModel(avatar);
    return newAvatar.save();
  }
  async deleteAvatar(ownerId: string) {
    return await this.avatarModel.deleteOne({ ownerId });
  }

  async deletePostPhoto(key: string) {
    return this.postPhotoModel.deleteOne({ key });
  }

  async deleteAllPostPhotos(postId: string): Promise<boolean> {
    await this.postPhotoModel.deleteMany({ postId });
    return (await this.postPhotoModel.countDocuments({ postId })) === 0;
  }
}
