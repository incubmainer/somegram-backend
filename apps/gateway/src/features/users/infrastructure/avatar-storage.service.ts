import {
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { FileStorageService } from 'apps/gateway/src/common/utils/file-storage.service';
import { v4 as uuidv4 } from 'uuid';
import { ObjectCannedACL } from '@aws-sdk/client-s3';
import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '@app/custom-logger';

@Injectable()
@LogClass({
  level: 'trace',
  loggerClassField: 'logger',
  active: () => process.env.NODE_ENV !== 'production',
})
export class AvatarStorageService {
  constructor(
    private readonly fileStorageService: FileStorageService,
    @InjectCustomLoggerService() private readonly logger: CustomLoggerService,
  ) {
    logger.setContext(AvatarStorageService.name);
  }
  public async saveAvatar(
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
      Key: `users/${userId}/avatars/${uuid}.${fileExtension}`,
      Body: avatar,
      ContentType: mimeType,
      ACL: ObjectCannedACL.public_read,
    };
    await s3Client.send(new PutObjectCommand(params));
    const avatarUrl = this.getAvatarUrl(params.Key);
    const avatarKey = params.Key;
    return { avatarUrl, avatarKey };
  }

  public getAvatarUrl(avatarKey: string): string {
    const publicUrl = this.fileStorageService.getPublicUrl();
    return `${publicUrl}/${avatarKey}`;
  }

  public async deleteAvatarByKey(
    avatarKey: string,
  ): Promise<DeleteObjectCommandOutput> {
    const s3Client = this.fileStorageService.getS3Client();
    const bucketName = this.fileStorageService.getBucketName();
    const params = {
      Bucket: bucketName,
      Key: avatarKey,
    };
    return await s3Client.send(new DeleteObjectCommand(params));
  }
}
