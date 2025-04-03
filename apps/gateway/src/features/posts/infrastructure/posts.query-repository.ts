import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { SearchQueryParameters } from '../../../common/domain/query.types';
import { getSanitizationQuery } from '../../../common/utils/query-params.sanitizator';
import { PostEntity } from '../domain/post.entity';
import { LoggerService } from '@app/logger';

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
    queryString?: SearchQueryParameters,
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
    queryString?: SearchQueryParameters,
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

  public async getPostsByUserIds(
    userIds: string[],
    queryString?: SearchQueryParameters,
    endCursorPostId?: string,
  ): Promise<{ posts: PostEntity[]; count: number }> {
    this.logger.debug(
      'Execute: get posts by userIds:',
      this.getPostsByUserIds.name,
    );

    const sanitizationQuery = getSanitizationQuery(queryString);

    let cursorCondition = {};
    if (endCursorPostId) {
      const endCursorPost = await this.txHost.tx.userPost.findUnique({
        where: { id: endCursorPostId },
        select: { createdAt: true, updatedAt: true },
      });

      if (endCursorPost) {
        const cursorField =
          sanitizationQuery.sortBy === 'createdAt' ? 'createdAt' : 'updatedAt';

        cursorCondition = {
          [cursorField]: {
            [sanitizationQuery.sortDirection === 'asc' ? 'gt' : 'lt']:
              endCursorPost[cursorField],
          },
        };
      }
    }

    const where = {
      userId: { in: userIds },
      ...cursorCondition,
    };

    const [posts, count] = await Promise.all([
      this.txHost.tx.userPost.findMany({
        where,
        orderBy: {
          [sanitizationQuery.sortBy]: sanitizationQuery.sortDirection,
        },
        take: sanitizationQuery.pageSize,
        ...(endCursorPostId && { skip: 1 }),
      }),
      this.txHost.tx.userPost.count({ where }),
    ]);

    return {
      posts: posts as PostEntity[],
      count,
    };
  }
}
