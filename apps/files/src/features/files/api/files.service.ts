import { Injectable } from '@nestjs/common';

import { S3Adapter } from '../../../common/application/adapters/s3.adapter';
import { Avatar } from '../models/avatar.model';
import { FileType } from '../../../../../../libs/common/enums/file-type.enum';
import { PostPhoto } from '../models/post-photomodel';
import { PhotosQueryRepository } from '../infrastructure/photos.query.repopository';

@Injectable()
export class PhotosService {
  constructor(
    private readonly fileQueryRepository: PhotosQueryRepository,
    private readonly s3Adapter: S3Adapter,
  ) {}
  getHello(): string {
    return 'Files started!';
  }

  async getUserAvatar(userId: string): Promise<FileType | null> {
    const avatar = await this.fileQueryRepository.findAvatar(userId);
    return avatar ? this.photoMapper(avatar) : null;
  }

  async getPostPhotos(postId: string): Promise<FileType[]> {
    const photos = await this.fileQueryRepository.findPostPhotos(postId);
    return this.photosMapper(photos);
  }

  async getUsersAvatar(userIds: string[]): Promise<FileType[] | null> {
    const avatars = await this.fileQueryRepository.getUsersAvatar(userIds);
    return avatars ? this.photosMapper(avatars) : null;
  }

  photosMapper(photos: Avatar[] | PostPhoto[]): FileType[] {
    return photos.map((photo: Avatar | PostPhoto) => {
      return this.photoMapper(photo);
    });
  }

  photoMapper(photo: Avatar | PostPhoto): FileType {
    return {
      ownerId: photo.ownerId,
      createdAt: photo.createdAt.toISOString(),
      originalname: photo.originalname,
      size: +photo.size,
      url: this.s3Adapter.getFileUrl(photo.key),
      key: photo.key,
      ...(photo && 'postId' in photo ? { postId: photo.postId } : {}),
    };
  }

  async getPostsPhotosByOwnerIds(ownerIds: string[]): Promise<FileType[]> {
    const photos =
      await this.fileQueryRepository.getPostsPhotosByOwnerIds(ownerIds);
    return this.photosMapper(photos);
  }

  async getPostsPhotosByPostsIds(postIds: string[]): Promise<FileType[]> {
    const photos =
      await this.fileQueryRepository.getPostsPhotosByPostsIds(postIds);
    return this.photosMapper(photos);
  }
}
