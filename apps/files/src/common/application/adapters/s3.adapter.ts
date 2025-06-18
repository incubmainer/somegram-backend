import { Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { FileDto } from '../../../../../gateway/src/features/posts/api/dto/input-dto/add-post.dto';

@Injectable()
export class S3Adapter {
  s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('S3_BUCKET_NAME');

    this.s3Client = new S3Client({
      region: this.configService.get<string>('S3_REGION'),
      endpoint: this.configService.get<string>('S3_CONNECTION_STRING'),
      credentials: {
        accessKeyId: this.configService.get<string>('S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get<string>('S3_SECRET_KEY'),
      },
    });
  }

  getFileUrl(key: string) {
    const base = this.configService.get<string>('S3_PUBLIC_URL');

    return `${base}/${key}`;
  }

  async saveAvatar(
    ownerId: string,
    file: FileDto,
  ): Promise<{ key: string; url: string }> {
    const fileExtension = file.mimetype.split('/')[1];
    const key = `content/users/${ownerId}/avatars/${randomUUID()}.${fileExtension}`;
    const extractedBuffer = Buffer.from(file.buffer);
    const bucketParams = {
      Bucket: this.bucketName,
      Key: key,
      Body: extractedBuffer,
      ContentType: file.mimetype,
      ACL: ObjectCannedACL.public_read,
    };

    const command = new PutObjectCommand(bucketParams);

    try {
      await this.s3Client.send(command);
      return {
        key,
        url: this.getFileUrl(key),
      };
    } catch (e) {
      throw e;
    }
  }

  async savePostPhoto(
    userId: string,
    postId: string,
    file: FileDto,
  ): Promise<{ key: string; url: string }> {
    const fileExtension = file.mimetype.split('/')[1];
    const key = `content/users/${userId}/posts/${postId}/${randomUUID()}.${fileExtension}`;
    const extractedBuffer = Buffer.from(file.buffer);
    const bucketParams = {
      Bucket: this.bucketName,
      Key: key,
      Body: extractedBuffer,
      ContentType: file.mimetype,
      ACL: ObjectCannedACL.public_read,
    };

    const command = new PutObjectCommand(bucketParams);

    try {
      await this.s3Client.send(command);
      return {
        key,
        url: this.getFileUrl(key),
      };
    } catch (e) {
      throw e;
    }
  }

  async saveVoiceMessage(
    chatId: string,
    messageId: string,
    file: FileDto,
  ): Promise<{ key: string; url: string }> {
    const fileExtension = file.mimetype.split('/')[1];
    const key = `content/messenger/${chatId}/${messageId}.${fileExtension}`;
    const extractedBuffer = Buffer.from(file.buffer);
    const bucketParams = {
      Bucket: this.bucketName,
      Key: key,
      Body: extractedBuffer,
      ContentType: file.mimetype,
      ACL: ObjectCannedACL.public_read,
    };

    const command = new PutObjectCommand(bucketParams);

    try {
      await this.s3Client.send(command);
      return {
        key,
        url: this.getFileUrl(key),
      };
    } catch (e) {
      throw e;
    }
  }

  async deleteImage(key: string) {
    const bucketParams = { Bucket: this.bucketName, Key: key };

    try {
      return await this.s3Client.send(new DeleteObjectCommand(bucketParams));
    } catch (e) {
      throw e;
    }
  }
}
