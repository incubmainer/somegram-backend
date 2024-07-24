import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { S3Config } from '../config/configs/s3.config';

@Injectable()
export class FileStorageService {
  private s3Client: S3Client;
  private s3PublicUrl: string;
  private s3BucketName: string;
  constructor(private readonly configService: ConfigService) {
    const s3Config = this.configService.get<S3Config>('s3');
    this.s3PublicUrl = s3Config.publicUrl;
    this.s3BucketName = s3Config.bucketName;
    this.s3Client = new S3Client({
      endpoint: s3Config.connectionString,
      region: s3Config.region,
      credentials: {
        accessKeyId: s3Config.accessKey,
        secretAccessKey: s3Config.secretKey,
      },
      forcePathStyle: true,
    });
  }
  getS3Client(): S3Client {
    return this.s3Client;
  }
  getBucketName(): string {
    return this.s3BucketName;
  }
  getPublicUrl(): string {
    return `${this.s3PublicUrl}`;
  }
}
