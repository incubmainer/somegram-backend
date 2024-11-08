import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';

import { PrismaClient as GatewayPrismaClient, UserPost } from '@prisma/gateway';
import { SearchQueryParametersType } from 'apps/gateway/src/common/domain/query.types';
import { getSanitizationQuery } from 'apps/gateway/src/common/utils/query-params.sanitizator';

@Injectable()
export class PostsQueryRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
  ) {}

  public async getPostById(postId: UserPost['id']): Promise<UserPost> {
    return await this.txHost.tx.userPost.findFirst({
      where: {
        id: postId,
      },
    });
  }

  public async getPostsByUser(
    userId: UserPost['userId'],
    queryString?: SearchQueryParametersType,
    endCursorPostId?: string,
  ) {
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
    const posts = await this.txHost.tx.userPost.findMany({
      where,
      orderBy: { [sanitizationQuery.sortBy]: sanitizationQuery.sortDirection },
      take: sanitizationQuery.pageSize,
    });

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
  ) {
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

    const posts = await this.txHost.tx.userPost.findMany({
      orderBy: { [sanitizationQuery.sortBy]: sanitizationQuery.sortDirection },
      where,
      take: sanitizationQuery.pageSize,
    });

    const count = await this.txHost.tx.userPost.count({
      where,
    });

    return {
      posts,
      count,
    };
  }
}
