import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';

import {
  PrismaClient as GatewayPrismaClient,
  PostPhoto,
  UserPost,
} from '@prisma/gateway';
import { SearchQueryParametersType } from 'apps/gateway/src/common/domain/query.types';
import { getSanitizationQuery } from 'apps/gateway/src/common/utils/query-params.sanitizator';

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

  public async getPostsWithPhotosByUser(
    userId: UserPost['userId'],
    queryString?: SearchQueryParametersType,
  ) {
    const sanitizationQuery = getSanitizationQuery(queryString);
    const offset =
      (sanitizationQuery.pageNumber - 1) * sanitizationQuery.pageSize;

    const posts = await this.txHost.tx.userPost.findMany({
      where: { userId },
      include: { postPhotos: true },
      orderBy: { [sanitizationQuery.sortBy]: sanitizationQuery.sortDirection },
      skip: offset,
      take: sanitizationQuery.pageSize,
    });

    const count = await this.txHost.tx.userPost.count({
      where: { userId },
    });

    return {
      posts,
      count,
    };
  }

  public async getAllPostsWithPhotos(queryString?: SearchQueryParametersType) {
    const sanitizationQuery = getSanitizationQuery(queryString);
    const offset =
      (sanitizationQuery.pageNumber - 1) * sanitizationQuery.pageSize;

    const posts = await this.txHost.tx.userPost.findMany({
      include: { postPhotos: true },
      orderBy: { [sanitizationQuery.sortBy]: sanitizationQuery.sortDirection },
      skip: offset,
      take: sanitizationQuery.pageSize,
    });

    const count = await this.txHost.tx.userPost.count({});

    return {
      posts,
      count,
    };
  }
}
