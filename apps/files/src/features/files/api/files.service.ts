import { Injectable } from '@nestjs/common';

import { PhotosQueryRepository } from '../infrastructure/photos.query.repopository';
import { S3Adapter } from '../../../common/application/adapters/s3.adapter';

@Injectable()
export class PhotosService {
  constructor(
    private readonly fileQueryRepository: PhotosQueryRepository,
    private readonly s3Adapter: S3Adapter,
  ) {}
  getHello(): string {
    return 'Files started!';
  }

  async getUserAvatar(userId: string) {
    const avatar = await this.fileQueryRepository.findAvatar(userId);
    return avatar ? this.s3Adapter.getFileUrl(avatar.key) : null;
  }

  async getPostPhotos(postId: string) {
    const photos = await this.fileQueryRepository.findPostPhotos(postId);
    return photos.map((photo) => this.s3Adapter.getFileUrl(photo.key));
  }
}
