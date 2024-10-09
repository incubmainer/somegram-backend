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

  public async getPostWithPhotosById(postId: UserPost['id']): Promise<
    {
      postPhotos: PostPhoto[];
    } & UserPost
  > {
    return await this.txHost.tx.userPost.findFirst({
      where: {
        id: postId,
      },
      include: {
        postPhotos: true,
      },
    });
  }
  public async getPostsWithPhotos(
    userId: UserPost['userId'],
    offset: number,
    limit: number,
  ) {
    const posts = await this.txHost.tx.userPost.findMany({
      where: { userId },
      include: { postPhotos: true },
      skip: offset,
      take: limit,
    });

    const count = await this.txHost.tx.userPost.count({
      where: { userId },
    });

    return {
      posts,
      count,
    };
  }
}
