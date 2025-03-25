import { UserPostWithOwnerInfo } from '../domain/types';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { LoggerService } from '@app/logger';
import { Injectable } from '@nestjs/common';
import { PrismaClient as GatewayPrismaClient, Prisma } from '@prisma/gateway';
import {
  AdminPostsSortByEnum,
  PostsQueryStringInput,
} from '../../resolvers/posts/models/posts-query-string-input';

@Injectable()
export class PostsGraphqlQueryRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PostsGraphqlQueryRepository.name);
  }

  public async getAllPostsWithOwnerInfo(
    query: PostsQueryStringInput,
  ): Promise<{ posts: UserPostWithOwnerInfo[]; count: number }> {
    this.logger.debug(
      `Execute: get all posts`,
      this.getAllPostsWithOwnerInfo.name,
    );

    const { sortBy, sortDirection, searchByUsername, pageSize, pageNumber } =
      query;

    let orderBy: Prisma.UserPostOrderByWithRelationInput;

    if (sortBy === AdminPostsSortByEnum.username) {
      orderBy = { User: { username: sortDirection } };
    } else {
      orderBy = { [sortBy]: sortDirection };
    }

    const where: Prisma.UserPostWhereInput = {
      ...(searchByUsername
        ? {
            User: {
              username: {
                contains: searchByUsername,
                mode: 'insensitive',
              },
            },
          }
        : {}),
    };

    const skip = (pageNumber - 1) * pageSize;

    const posts = (await this.txHost.tx.userPost.findMany({
      where,
      include: {
        User: true,
      },
      skip,
      take: pageSize,
      orderBy,
    })) as UserPostWithOwnerInfo[];

    const count = await this.txHost.tx.userPost.count({
      where,
    });

    return {
      posts,
      count,
    };
  }

  public async getPostByIdWithOwnerInfo(
    postId: string,
  ): Promise<UserPostWithOwnerInfo | null> {
    this.logger.debug(
      `Execute: get post by id with owner info`,
      this.getPostByIdWithOwnerInfo.name,
    );

    const result = await this.txHost.tx.userPost.findUnique({
      where: { id: postId },
      include: { User: true },
    });

    return result ? (result as UserPostWithOwnerInfo) : null;
  }
}
