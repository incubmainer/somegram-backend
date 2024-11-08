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
    postId: string,
    photo: Buffer,
    mimeType: string,
  ): Promise<{
    photoUrl: string;
    photoKey: string;
  }> {
    const s3Client = this.fileStorageService.getS3Client();
    const fileExtension = mimeType.split('/')[1];
    const uuid = uuidv4();
    const bucketName = this.fileStorageService.getBucketName();
    const params = {
      Bucket: bucketName,
      Key: `users/${userId}/posts/${postId}/${uuid}.${fileExtension}`,
      Body: photo,
      ContentType: mimeType,
      ACL: ObjectCannedACL.public_read,
    };
    await s3Client.send(new PutObjectCommand(params));
    const photoUrl = this.getPhotoUrl(params.Key);
    const photoKey = params.Key;
    return { photoUrl, photoKey };
  }

  public getPhotoUrl(photoKey: string): string {
    const publicUrl = this.fileStorageService.getPublicUrl();
    return `${publicUrl}/${photoKey}`;
  }

  public async deletePhotoByKey(photoKey: string) {
    const s3Client = this.fileStorageService.getS3Client();
    const bucketName = this.fileStorageService.getBucketName();
    const params = {
      Bucket: bucketName,
      Key: photoKey,
    };
    return await s3Client.send(new DeleteObjectCommand(params));
  }
}
