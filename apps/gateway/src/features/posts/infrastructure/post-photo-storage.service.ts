import { Injectable } from '@nestjs/common';
import { FileStorageService } from '../../../common/utils/file-storage.service';
import { v4 as uuidv4 } from 'uuid';
import {
  DeleteObjectCommand,
  ObjectCannedACL,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

@Injectable()
export class PostPhotoStorageService {
  constructor(private readonly fileStorageService: FileStorageService) {}
  public async savePhoto(
    userId: string,
    avatar: Buffer,
    mimeType: string,
  ): Promise<{
    avatarUrl: string;
    avatarKey: string;
  }> {
    const s3Client = this.fileStorageService.getS3Client();
    const fileExtension = mimeType.split('/')[1];
    const uuid = uuidv4();
    const bucketName = this.fileStorageService.getBucketName();
    const params = {
      Bucket: bucketName,
      Key: `users/${userId}/posts/${uuid}.${fileExtension}`,
      Body: avatar,
      ContentType: mimeType,
      ACL: ObjectCannedACL.public_read,
    };
    await s3Client.send(new PutObjectCommand(params));
    const avatarUrl = this.getPhotoUrl(params.Key);
    const avatarKey = params.Key;
    return { avatarUrl, avatarKey };
  }

  public getPhotoUrl(avatarKey: string): string {
    const publicUrl = this.fileStorageService.getPublicUrl();
    const bucketName = this.fileStorageService.getBucketName();
    return `${publicUrl}/${bucketName}/${avatarKey}`;
  }

  public async deletePhotoByKey(avatarKey: string): Promise<void> {
    const s3Client = this.fileStorageService.getS3Client();
    const bucketName = this.fileStorageService.getBucketName();
    const params = {
      Bucket: bucketName,
      Key: avatarKey,
    };
    await s3Client.send(new DeleteObjectCommand(params));
  }
}