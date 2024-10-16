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

  public async addPost(dto: {
    postId: UserPost['id'];
    userId: UserPost['userId'];
    createdAt: UserPost['createdAt'];
    description: UserPost['description'];
  }): Promise<UserPost> {
    return await this.txHost.tx.userPost.create({
      data: {
        id: dto.postId,
        createdAt: dto.createdAt,
        userId: dto.userId,
        description: dto.description,
      },
    });
  }

  public async findPost(postId: UserPost['id']): Promise<UserPost | null> {
    return await this.txHost.tx.userPost.findFirst({
      where: {
        id: postId,
      },
    });
  }

  public async updatePost(dto: {
    postId: UserPost['id'];
    description: UserPost['description'];
    updatedAt: UserPost['updatedAt'];
  }): Promise<UserPost | null> {
    return await this.txHost.tx.userPost.update({
      data: {
        description: dto.description,
        updatedAt: dto.updatedAt,
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
