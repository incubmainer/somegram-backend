import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { PrismaClient as GatewayPrismaClient, Prisma } from '@prisma/gateway';
import { SearchQueryParametersType } from '../../../common/domain/query.types';
import { getSanitizationQuery } from '../../../common/utils/query-params.sanitizator';
import { PostEntity } from '../domain/post.entity';
import { LoggerService } from '@app/logger';
import { UserPostWithOwnerInfo } from '../domain/types';

@Injectable()
export class PostsQueryRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PostsQueryRepository.name);
  }

  public async getPostById(postId: string): Promise<PostEntity | null> {
    this.logger.debug(
      `Execute: get post by id: ${postId}`,
      this.getPostById.name,
    );
    const post = await this.txHost.tx.userPost.findFirst({
      where: {
        id: postId,
      },
    });

    return post ? new PostEntity(post) : null;
  }

  public async getPostsByUser(
    userId: string,
    queryString?: SearchQueryParametersType,
    endCursorPostId?: string,
  ): Promise<{ posts: PostEntity[]; count: number }> {
    this.logger.debug(
      `Execute: get posts by user id: ${userId}`,
      this.getPostsByUser.name,
    );

    const sanitizationQuery = getSanitizationQuery(queryString);

    let endCursorCreatedAt: Date | undefined = undefined;
    let endCursorUpdatedAt: Date | undefined = undefined;

    if (endCursorPostId) {
      const endCursorPost = await this.txHost.tx.userPost.findUnique({
        where: { id: endCursorPostId },
        select: {
          createdAt: true,
          updatedAt: true,
        },
      });

      if (endCursorPost) {
        endCursorCreatedAt = endCursorPost.createdAt;
        endCursorUpdatedAt = endCursorPost.updatedAt;
      }
    }

    const where = {
      userId,
      ...(sanitizationQuery.sortBy === 'createdAt' && endCursorCreatedAt
        ? {
            createdAt: {
              [sanitizationQuery.sortDirection === 'asc' ? 'gt' : 'lt']:
                endCursorCreatedAt,
            },
          }
        : {}),
      ...(sanitizationQuery.sortBy === 'updatedAt' && endCursorUpdatedAt
        ? {
            updatedAt: {
              [sanitizationQuery.sortDirection === 'asc' ? 'gt' : 'lt']:
                endCursorUpdatedAt,
            },
          }
        : {}),
    };
    const posts = (await this.txHost.tx.userPost.findMany({
      where,
      orderBy: { [sanitizationQuery.sortBy]: sanitizationQuery.sortDirection },
      take: sanitizationQuery.pageSize,
    })) as PostEntity[];

    const count = await this.txHost.tx.userPost.count({
      where,
    });

    return {
      posts,
      count,
    };
  }

  public async getAllPosts(
    queryString?: SearchQueryParametersType,
    endCursorPostId?: string,
  ): Promise<{ posts: PostEntity[]; count: number }> {
    this.logger.debug(`Execute: get all posts`, this.getAllPosts.name);
    const sanitizationQuery = getSanitizationQuery(queryString);

    let endCursorCreatedAt: Date | undefined = undefined;
    let endCursorUpdatedAt: Date | undefined = undefined;

    if (endCursorPostId) {
      const endCursorPost = await this.txHost.tx.userPost.findUnique({
        where: { id: endCursorPostId },
        select: {
          createdAt: true,
          updatedAt: true,
        },
      });

      if (endCursorPost) {
        endCursorCreatedAt = endCursorPost.createdAt;
        endCursorUpdatedAt = endCursorPost.updatedAt;
      }
    }

    const where = {
      ...(sanitizationQuery.sortBy === 'createdAt' && endCursorCreatedAt
        ? {
            createdAt: {
              [sanitizationQuery.sortDirection === 'asc' ? 'gt' : 'lt']:
                endCursorCreatedAt,
            },
          }
        : {}),
      ...(sanitizationQuery.sortBy === 'updatedAt' && endCursorUpdatedAt
        ? {
            updatedAt: {
              [sanitizationQuery.sortDirection === 'asc' ? 'gt' : 'lt']:
                endCursorUpdatedAt,
            },
          }
        : {}),
    };

    const posts = (await this.txHost.tx.userPost.findMany({
      orderBy: { [sanitizationQuery.sortBy]: sanitizationQuery.sortDirection },
      where,
      take: sanitizationQuery.pageSize,
    })) as PostEntity[];

    const count = await this.txHost.tx.userPost.count({
      where,
    });

    return {
      posts,
      count,
    };
  }

  public async getAllPostsWithOwnerInfo(
    where: Prisma.UserPostWhereInput,
    orderBy: Prisma.UserPostOrderByWithRelationInput,
    take: number,
    skip: number,
  ): Promise<{ posts: UserPostWithOwnerInfo[]; count: number }> {
    this.logger.debug(
      `Execute: get all posts`,
      this.getAllPostsWithOwnerInfo.name,
    );
    const posts = (await this.txHost.tx.userPost.findMany({
      where,
      include: {
        User: true,
      },
      skip,
      take,
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
}
