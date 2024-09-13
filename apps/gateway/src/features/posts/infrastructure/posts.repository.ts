import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import {
  PrismaClient as GatewayPrismaClient,
  PostPhoto,
  UserPost,
} from '@prisma/gateway';
@Injectable()
export class PostsRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
  ) {}
  public async addInfoAboutPhoto(dto: {
    postId: PostPhoto['postId'];
    photoKey: PostPhoto['photoKey'];
    createdAt: PostPhoto['createdAt'];
  }): Promise<void> {
    await this.txHost.tx.postPhoto.create({
      data: {
        postId: dto.postId,
        photoKey: dto.photoKey,
        createdAt: dto.createdAt,
      },
    });
  }
  public async addPost(dto: {
    postId: UserPost['id'];
    userId: UserPost['userId'];
    description: UserPost['description'];
  }): Promise<void> {
    await this.txHost.tx.userPost.create({
      data: {
        id: dto.postId,
        userId: dto.userId,
        description: dto.description,
      },
    });
  }

  public async updatePost(dto: {
    postId: UserPost['id'];
    description: UserPost['description'];
  }): Promise<UserPost | null> {
    return await this.txHost.tx.userPost.update({
      data: {
        description: dto.description,
      },
      where: {
        id: dto.postId,
      },
    });
  }
  public async deletePost(dto: { postId: UserPost['id'] }) {
    return await this.txHost.tx.userPost.delete({
      where: {
        id: dto.postId,
      },
    });
  }
}
