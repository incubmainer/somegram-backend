import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import {
  PrismaClient as GatewayPrismaClient,
  PostsPhotos,
  UserPosts,
} from '@prisma/gateway';
@Injectable()
export class PostsRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
  ) {}
  public async addInfoAboutPhoto(dto: {
    postId: PostsPhotos['postId'];
    userId: PostsPhotos['userId'];
    photoKey: PostsPhotos['photoKey'];
    createdAt: PostsPhotos['createdAt'];
  }): Promise<void> {
    await this.txHost.tx.postsPhotos.create({
      data: {
        postId: dto.postId,
        userId: dto.userId,
        photoKey: dto.photoKey,
        createdAt: dto.createdAt,
      },
    });
  }
  public async addPost(dto: {
    postId: UserPosts['id'];
    userId: UserPosts['userId'];
    description: UserPosts['description'];
  }): Promise<void> {
    await this.txHost.tx.userPosts.create({
      data: {
        id: dto.postId,
        userId: dto.userId,
        description: dto.description,
      },
    });
  }
}
