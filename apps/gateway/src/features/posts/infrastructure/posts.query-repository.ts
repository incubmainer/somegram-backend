import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import {
  PrismaClient as GatewayPrismaClient,
  PostPhoto,
  UserPost,
} from '@prisma/gateway';
@Injectable()
export class PostsQueryRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
  ) {}

  public async findPost(postId: UserPost['id']): Promise<UserPost | null> {
    return await this.txHost.tx.userPost.findFirst({
      where: {
        id: postId,
      },
    });
  }

  public async getPostPhotosInfo(postId: UserPost['id']): Promise<PostPhoto[]> {
    return await this.txHost.tx.postPhoto.findMany({
      where: {
        postId: postId,
      },
    });
  }
}
