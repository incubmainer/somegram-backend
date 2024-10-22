import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import {
  PrismaClient as GatewayPrismaClient,
  PostPhoto,
} from '@prisma/gateway';
@Injectable()
export class PostPhotoRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
  ) {}

  public async addInfoAboutUploadedPhoto(dto: {
    userId: PostPhoto['userId'];
    postId: PostPhoto['postId'];
    photoKey: PostPhoto['photoKey'];
    createdAt: PostPhoto['createdAt'];
    width: PostPhoto['width'];
    height: PostPhoto['height'];
    size: PostPhoto['size'];
  }): Promise<PostPhoto> {
    return await this.txHost.tx.postPhoto.create({
      data: {
        userId: dto.userId,
        postId: dto.postId,
        photoKey: dto.photoKey,
        createdAt: dto.createdAt,
        width: dto.width,
        height: dto.height,
        size: dto.size,
      },
    });
  }

  public async deletePhotosInfo(postId: PostPhoto['postId']) {
    return await this.txHost.tx.postPhoto.deleteMany({
      where: { postId },
    });
  }
}
